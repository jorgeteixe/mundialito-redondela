"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@mr/db";
import { requireAdminWrite } from "@/lib/authz";
import { resolveBracket } from "@/lib/bracket-resolver";
import { triggerResultsPublishAfterSave } from "@/lib/trigger";
import { resolveScorePair } from "./result-score";

const { match } = schema;

const RESULTADOS_PATH = "/resultados";
const CALENDARIO_PATH = "/calendario";
const CATEGORY_CALENDARIO_PATH = "/[category]/calendario";
const GROUPS_PATH = "/[category]/groups";
const GROUP_DETAIL_PATH = "/[category]/groups/[stage]/[groupId]";
const ELIMINATORIAS_PATH = "/[category]/eliminatorias";

export type ResultFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    homeScore?: string;
    awayScore?: string;
    homePenalties?: string;
    awayPenalties?: string;
  };
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function saveMatchResult(
  _state: ResultFormState,
  formData: FormData,
): Promise<ResultFormState> {
  await requireAdminWrite();

  const id = typeof formData.get("id") === "string" ? formData.get("id") : "";
  if (!id || typeof id !== "string") {
    return { status: "error", message: "El partido no existe." };
  }

  const [row] = await db
    .select({ category: match.category, kind: match.kind })
    .from(match)
    .where(eq(match.id, id))
    .limit(1);

  if (!row) {
    return { status: "error", message: "El partido no existe." };
  }

  const isKnockout = row.kind !== "group";

  const score = resolveScorePair(
    readString(formData, "homeScore"),
    readString(formData, "awayScore"),
    "Rellena ambos resultados.",
  );
  const penalties = isKnockout
    ? resolveScorePair(
        readString(formData, "homePenalties"),
        readString(formData, "awayPenalties"),
        "Rellena ambos penaltis.",
      )
    : {
        homeValue: null,
        awayValue: null,
        fieldErrors: {} as { home?: string; away?: string },
        hasError: false,
      };

  if (score.hasError || penalties.hasError) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        homeScore: score.fieldErrors.home,
        awayScore: score.fieldErrors.away,
        homePenalties: penalties.fieldErrors.home,
        awayPenalties: penalties.fieldErrors.away,
      },
    };
  }

  // Penalties only make sense once regular time ends level.
  if (
    isKnockout &&
    penalties.homeValue !== null &&
    score.homeValue !== null &&
    score.homeValue !== score.awayValue
  ) {
    return {
      status: "error",
      message:
        "Los penaltis solo se registran cuando el partido acaba en empate.",
      fieldErrors: {
        homePenalties: "El resultado no está empatado.",
        awayPenalties: "El resultado no está empatado.",
      },
    };
  }

  await db
    .update(match)
    .set({
      homeScore: score.homeValue,
      awayScore: score.awayValue,
      homePenalties: penalties.homeValue,
      awayPenalties: penalties.awayValue,
    })
    .where(eq(match.id, id));

  // A saved result can change standings and knockout faces, so re-resolve the
  // bracket and refresh every view that renders this match.
  await resolveBracket(row.category);
  try {
    await triggerResultsPublishAfterSave({ matchId: id });
  } catch (error) {
    console.error("Failed to trigger result publication workflow", error);
  }
  revalidatePath(RESULTADOS_PATH, "page");
  revalidatePath(CALENDARIO_PATH, "page");
  revalidatePath(CATEGORY_CALENDARIO_PATH, "page");
  revalidatePath(GROUPS_PATH, "page");
  revalidatePath(GROUP_DETAIL_PATH, "page");
  revalidatePath(ELIMINATORIAS_PATH, "page");

  return { status: "success", message: "Resultado guardado." };
}
