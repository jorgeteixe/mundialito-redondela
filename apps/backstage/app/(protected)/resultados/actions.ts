"use server";

import { revalidatePath } from "next/cache";
import { applyMatchResult, resolveScorePair } from "@mr/tournament";
import { requireAdminWrite } from "@/lib/authz";

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

  // Parse the score/penalty pairs here so the form can surface per-field errors
  // ("fill both", "use an integer"); the cross-cutting rules (penalties only on
  // a level knockout, etc.) live in applyMatchResult.
  const score = resolveScorePair(
    readString(formData, "homeScore"),
    readString(formData, "awayScore"),
    "Rellena ambos resultados.",
  );
  const penalties = resolveScorePair(
    readString(formData, "homePenalties"),
    readString(formData, "awayPenalties"),
    "Rellena ambos penaltis.",
  );

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

  const outcome = await applyMatchResult({
    matchId: id,
    homeScore: score.homeValue,
    awayScore: score.awayValue,
    homePenalties: penalties.homeValue,
    awayPenalties: penalties.awayValue,
  });

  if (!outcome.ok) {
    if (outcome.code === "penalties-not-level") {
      return {
        status: "error",
        message: outcome.message,
        fieldErrors: {
          homePenalties: "El resultado no está empatado.",
          awayPenalties: "El resultado no está empatado.",
        },
      };
    }
    return { status: "error", message: outcome.message };
  }

  // A saved result can change standings and knockout faces, so refresh every
  // view that renders this match.
  revalidatePath(RESULTADOS_PATH, "page");
  revalidatePath(CALENDARIO_PATH, "page");
  revalidatePath(CATEGORY_CALENDARIO_PATH, "page");
  revalidatePath(GROUPS_PATH, "page");
  revalidatePath(GROUP_DETAIL_PATH, "page");
  revalidatePath(ELIMINATORIAS_PATH, "page");

  return { status: "success", message: "Resultado guardado." };
}
