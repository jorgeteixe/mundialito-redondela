"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gt, lt, ne } from "drizzle-orm";
import { db, schema } from "@mr/db";
import { requireAdminWrite } from "@/lib/authz";
import { isCategory, type Category } from "@/lib/category";
import { conflictWindow } from "@/lib/match-schedule";
import { resolveBracket } from "@/lib/bracket-resolver";
import type { KnockoutKind } from "./data";

const { match, team } = schema;
const tournamentTimeZone = "Europe/Madrid";
const ELIMINATORIAS_PATH = "/[category]/eliminatorias";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    category?: string;
    kind?: string;
    homeTeamId?: string;
    awayTeamId?: string;
    homePlaceholder?: string;
    awayPlaceholder?: string;
    scheduledAt?: string;
    homeScore?: string;
    awayScore?: string;
  };
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value ? value : null;
}

function readKind(formData: FormData): KnockoutKind | null {
  const kind = readString(formData, "kind");
  if (kind === "semifinal" || kind === "third_place" || kind === "final") {
    return kind;
  }
  return null;
}

function parseMadridDateTime(value: string) {
  const parsed =
    /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2})$/.exec(
      value,
    );
  const groups = parsed?.groups;
  if (!groups) return null;

  const parts = {
    year: Number.parseInt(groups.year!, 10),
    month: Number.parseInt(groups.month!, 10),
    day: Number.parseInt(groups.day!, 10),
    hour: Number.parseInt(groups.hour!, 10),
    minute: Number.parseInt(groups.minute!, 10),
  };

  if (
    parts.month < 1 ||
    parts.month > 12 ||
    parts.day < 1 ||
    parts.day > 31 ||
    parts.hour > 23 ||
    parts.minute > 59
  ) {
    return null;
  }

  const utc = zonedWallTimeToUtc(parts, tournamentTimeZone);
  return matchesZonedWallTime(utc, parts, tournamentTimeZone) ? utc : null;
}

function zonedWallTimeToUtc(
  parts: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  },
  timeZone: string,
) {
  let utcMs = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  );

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const zonedParts = getZonedParts(new Date(utcMs), timeZone);
    const zonedAsUtcMs = Date.UTC(
      zonedParts.year,
      zonedParts.month - 1,
      zonedParts.day,
      zonedParts.hour,
      zonedParts.minute,
    );
    const targetAsUtcMs = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
    );
    utcMs -= zonedAsUtcMs - targetAsUtcMs;
  }

  return new Date(utcMs);
}

function matchesZonedWallTime(
  date: Date,
  expected: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  },
  timeZone: string,
) {
  const actual = getZonedParts(date, timeZone);
  return (
    actual.year === expected.year &&
    actual.month === expected.month &&
    actual.day === expected.day &&
    actual.hour === expected.hour &&
    actual.minute === expected.minute
  );
}

function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number.parseInt(parts.year!, 10),
    month: Number.parseInt(parts.month!, 10),
    day: Number.parseInt(parts.day!, 10),
    hour: Number.parseInt(parts.hour!, 10),
    minute: Number.parseInt(parts.minute!, 10),
  };
}

async function hasScheduleConflict(scheduledAt: Date, excludeMatchId?: string) {
  const { start, end } = conflictWindow(scheduledAt);
  const conflicts = await db
    .select({ id: match.id })
    .from(match)
    .where(
      and(
        gt(match.scheduledAt, start),
        lt(match.scheduledAt, end),
        excludeMatchId ? ne(match.id, excludeMatchId) : undefined,
      ),
    )
    .limit(1);

  return conflicts.length > 0;
}

async function validateTeamIds(category: Category, ids: string[]) {
  if (ids.length === 0) return true;
  const rows = await db
    .select({ id: team.id })
    .from(team)
    .where(and(eq(team.category, category)));
  const valid = new Set(rows.map((row) => row.id));
  return ids.every((id) => valid.has(id));
}

function readInput(formData: FormData) {
  const category = readString(formData, "category");
  const kind = readKind(formData);
  const homeTeamId = readNullableString(formData, "homeTeamId");
  const awayTeamId = readNullableString(formData, "awayTeamId");
  const homePlaceholder = readNullableString(formData, "homePlaceholder");
  const awayPlaceholder = readNullableString(formData, "awayPlaceholder");
  const scheduledRaw = readString(formData, "scheduledAt");
  const scheduledAt = scheduledRaw ? parseMadridDateTime(scheduledRaw) : null;

  return {
    category,
    kind,
    homeTeamId,
    awayTeamId,
    homePlaceholder,
    awayPlaceholder,
    scheduledAt,
  };
}

function validateInput(input: ReturnType<typeof readInput>): FormState | null {
  if (
    !isCategory(input.category) ||
    !input.kind ||
    (!input.homeTeamId && !input.homePlaceholder) ||
    (!input.awayTeamId && !input.awayPlaceholder) ||
    !input.scheduledAt ||
    Number.isNaN(input.scheduledAt.getTime())
  ) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        category: isCategory(input.category)
          ? undefined
          : "Falta la categoría.",
        kind: input.kind ? undefined : "Selecciona una ronda.",
        homeTeamId:
          input.homeTeamId || input.homePlaceholder
            ? undefined
            : "Selecciona un equipo.",
        awayTeamId:
          input.awayTeamId || input.awayPlaceholder
            ? undefined
            : "Selecciona un equipo.",
        homePlaceholder:
          input.homeTeamId || input.homePlaceholder
            ? undefined
            : "Indica un equipo.",
        awayPlaceholder:
          input.awayTeamId || input.awayPlaceholder
            ? undefined
            : "Indica un equipo.",
        scheduledAt:
          input.scheduledAt && !Number.isNaN(input.scheduledAt.getTime())
            ? undefined
            : "Indica una fecha y hora válidas.",
      },
    };
  }

  if (
    input.homeTeamId &&
    input.awayTeamId &&
    input.homeTeamId === input.awayTeamId
  ) {
    return {
      status: "error",
      message: "Selecciona dos equipos distintos.",
      fieldErrors: { awayTeamId: "El rival debe ser distinto." },
    };
  }

  return null;
}

export async function createEliminatoriaMatch(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const input = readInput(formData);
  const invalid = validateInput(input);
  if (invalid) return invalid;

  if (
    !(await validateTeamIds(
      input.category as Category,
      [input.homeTeamId, input.awayTeamId].filter(Boolean) as string[],
    ))
  ) {
    return {
      status: "error",
      message: "Selecciona equipos de la categoría.",
    };
  }

  if (await hasScheduleConflict(input.scheduledAt!)) {
    return {
      status: "error",
      message: "Ya hay un partido programado en ese horario.",
      fieldErrors: { scheduledAt: "El campo está ocupado a esa hora." },
    };
  }

  // Results (status + score) are set in a dedicated view, not here.
  await db.insert(match).values({
    category: input.category as Category,
    groupId: null,
    kind: input.kind!,
    homeTeamId: input.homeTeamId,
    awayTeamId: input.awayTeamId,
    homePlaceholder: input.homePlaceholder,
    awayPlaceholder: input.awayPlaceholder,
    scheduledAt: input.scheduledAt!,
  });

  await resolveBracket(input.category as Category);
  revalidatePath(ELIMINATORIAS_PATH, "page");
  return { status: "success", message: "Partido programado." };
}

export async function updateEliminatoriaMatch(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const id = readString(formData, "id");
  const input = readInput(formData);
  const invalid = validateInput(input);
  if (!id) return { status: "error", message: "El partido no existe." };
  if (invalid) return invalid;

  if (
    !(await validateTeamIds(
      input.category as Category,
      [input.homeTeamId, input.awayTeamId].filter(Boolean) as string[],
    ))
  ) {
    return {
      status: "error",
      message: "Selecciona equipos de la categoría.",
    };
  }

  if (await hasScheduleConflict(input.scheduledAt!, id)) {
    return {
      status: "error",
      message: "Ya hay un partido programado en ese horario.",
      fieldErrors: { scheduledAt: "El campo está ocupado a esa hora." },
    };
  }

  // Results (status + score) are managed elsewhere; only scheduling is edited here.
  await db
    .update(match)
    .set({
      kind: input.kind!,
      homeTeamId: input.homeTeamId,
      awayTeamId: input.awayTeamId,
      homePlaceholder: input.homePlaceholder,
      awayPlaceholder: input.awayPlaceholder,
      scheduledAt: input.scheduledAt!,
    })
    .where(
      and(eq(match.id, id), eq(match.category, input.category as Category)),
    );

  // A finished semifinal feeds the final / third-place match — re-resolve.
  await resolveBracket(input.category as Category);
  revalidatePath(ELIMINATORIAS_PATH, "page");
  return { status: "success", message: "Partido actualizado." };
}

export async function recalcBracket(formData: FormData): Promise<void> {
  await requireAdminWrite();

  const category = readString(formData, "category");
  if (!isCategory(category)) return;

  await resolveBracket(category);
  revalidatePath(ELIMINATORIAS_PATH, "page");
  revalidatePath("/[category]/groups", "page");
  revalidatePath("/[category]/groups/[stage]/[groupId]", "page");
}

export async function deleteEliminatoriaMatch(formData: FormData) {
  await requireAdminWrite();

  const id = readString(formData, "id");
  if (!id) return;

  await db.delete(match).where(eq(match.id, id));
  revalidatePath(ELIMINATORIAS_PATH, "page");
}
