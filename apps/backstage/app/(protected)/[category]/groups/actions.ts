"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, gt, inArray, lt, ne } from "drizzle-orm";
import { db, schema } from "@mr/db";
import { requireAdminWrite } from "@/lib/authz";
import { isCategory } from "@/lib/category";
import { isGroupStage } from "@/lib/group-stage";
import { conflictWindow } from "@/lib/match-schedule";
import { resolveBracket } from "@mr/tournament";

const { match, team, tournamentGroup, tournamentGroupTeam } = schema;
const tournamentTimeZone = "Europe/Madrid";

// Dynamic-segment revalidation across every category variant of these routes.
const TEAMS_PATH = "/[category]/teams";
const GROUPS_PATH = "/[category]/groups";
const GROUP_DETAIL_PATH = "/[category]/groups/[stage]/[groupId]";
const ELIMINATORIAS_PATH = "/[category]/eliminatorias";

// A saved result can change standings, so re-run the bracket resolver to push
// advancing teams into F2 groups + knockout faces, then refresh those views.
async function syncBracket(category: "senior" | "cadet") {
  await resolveBracket(category);
  revalidatePath(GROUPS_PATH, "page");
  revalidatePath(GROUP_DETAIL_PATH, "page");
  revalidatePath(ELIMINATORIAS_PATH, "page");
}

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    name?: string;
    avatarLabel?: string;
    groupId?: string;
    teamId?: string;
    homeTeamId?: string;
    awayTeamId?: string;
    homePlaceholder?: string;
    awayPlaceholder?: string;
    scheduledAt?: string;
    status?: string;
    homeScore?: string;
    awayScore?: string;
  };
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateName(formData: FormData) {
  const name = readString(formData, "name");

  if (!name) {
    return {
      name,
      error: "El nombre es obligatorio.",
    };
  }

  if (name.length > 120) {
    return {
      name,
      error: "El nombre debe tener 120 caracteres o menos.",
    };
  }

  return { name };
}

function validateAvatarLabel(formData: FormData) {
  const avatarLabel = readString(formData, "avatarLabel").toUpperCase();

  if (!avatarLabel) {
    return {
      avatarLabel,
      error: "La letra o número es obligatorio.",
    };
  }

  if (!/^[A-Z0-9]$/.test(avatarLabel)) {
    return {
      avatarLabel,
      error: "Usa una sola letra o número.",
    };
  }

  return { avatarLabel };
}

function readNullableString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value ? value : null;
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

export async function createGroup(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const nameResult = validateName(formData);
  const avatarResult = validateAvatarLabel(formData);
  const category = readString(formData, "category");
  const stage = readString(formData, "stage");

  if (
    nameResult.error ||
    avatarResult.error ||
    !isCategory(category) ||
    !isGroupStage(stage)
  ) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        name: nameResult.error,
        avatarLabel: avatarResult.error,
      },
    };
  }

  await db.insert(tournamentGroup).values({
    name: nameResult.name,
    avatarLabel: avatarResult.avatarLabel,
    category,
    stage,
  });

  revalidatePath(GROUPS_PATH, "page");
  return { status: "success", message: "Grupo registrado." };
}

export async function updateGroup(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const id = readString(formData, "id");
  const nameResult = validateName(formData);
  const avatarResult = validateAvatarLabel(formData);

  if (!id || nameResult.error || avatarResult.error) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        name: nameResult.error,
        avatarLabel: avatarResult.error,
      },
    };
  }

  await db
    .update(tournamentGroup)
    .set({
      name: nameResult.name,
      avatarLabel: avatarResult.avatarLabel,
    })
    .where(eq(tournamentGroup.id, id));

  revalidatePath(GROUPS_PATH, "page");
  revalidatePath(GROUP_DETAIL_PATH, "page");
  return { status: "success", message: "Grupo actualizado." };
}

export async function deleteGroup(formData: FormData) {
  await requireAdminWrite();

  const id = readString(formData, "id");
  const redirectTo = readString(formData, "redirectTo");

  if (!id) return;

  await db.delete(tournamentGroup).where(eq(tournamentGroup.id, id));

  revalidatePath(GROUPS_PATH, "page");
  revalidatePath(TEAMS_PATH, "page");
  if (redirectTo) redirect(redirectTo);
}

export async function addTeamToGroup(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const groupId = readString(formData, "groupId");
  const teamId = readString(formData, "teamId");

  if (!groupId || !teamId) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        groupId: groupId ? undefined : "Falta el grupo.",
        teamId: teamId ? undefined : "Selecciona un equipo.",
      },
    };
  }

  const [group] = await db
    .select({
      category: tournamentGroup.category,
      stage: tournamentGroup.stage,
    })
    .from(tournamentGroup)
    .where(eq(tournamentGroup.id, groupId))
    .limit(1);

  if (!group) {
    return {
      status: "error",
      message: "Selecciona un grupo válido.",
      fieldErrors: {
        groupId: "El grupo no existe.",
      },
    };
  }

  const [selectedTeam] = await db
    .select({ id: team.id })
    .from(team)
    .where(and(eq(team.id, teamId), eq(team.category, group.category)))
    .limit(1);

  if (!selectedTeam) {
    return {
      status: "error",
      message: "Selecciona un equipo disponible.",
      fieldErrors: {
        teamId: "El equipo no está disponible para esta categoría.",
      },
    };
  }

  const [membership] = await db
    .insert(tournamentGroupTeam)
    .values({ groupId, teamId, stage: group.stage })
    .onConflictDoNothing()
    .returning({ teamId: tournamentGroupTeam.teamId });

  if (!membership) {
    return {
      status: "error",
      message: "El equipo ya está asignado en esta fase.",
      fieldErrors: {
        teamId: "El equipo ya pertenece a un grupo de esta fase.",
      },
    };
  }

  return { status: "success", message: "Equipo añadido." };
}

export async function removeTeamFromGroup(formData: FormData) {
  await requireAdminWrite();

  const groupId = readString(formData, "groupId");
  const teamId = readString(formData, "teamId");

  if (!groupId || !teamId) return;

  await db
    .delete(tournamentGroupTeam)
    .where(
      and(
        eq(tournamentGroupTeam.teamId, teamId),
        eq(tournamentGroupTeam.groupId, groupId),
      ),
    );

  revalidatePath(GROUPS_PATH, "page");
  revalidatePath(GROUP_DETAIL_PATH, "page");
  revalidatePath(TEAMS_PATH, "page");
}

// The tournament runs on a single shared field, so a new match conflicts with
// any existing match (either category) whose 30-minute slot overlaps.
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

const SCHEDULE_CONFLICT_STATE: FormState = {
  status: "error",
  message: "Ya hay un partido programado en ese horario.",
  fieldErrors: {
    scheduledAt: "El campo está ocupado a esa hora.",
  },
};

export async function createGroupMatch(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const groupId = readString(formData, "groupId");
  const homeTeamId = readNullableString(formData, "homeTeamId");
  const awayTeamId = readNullableString(formData, "awayTeamId");
  const homePlaceholder = readNullableString(formData, "homePlaceholder");
  const awayPlaceholder = readNullableString(formData, "awayPlaceholder");
  const scheduledRaw = readString(formData, "scheduledAt");
  const scheduledAt = scheduledRaw ? parseMadridDateTime(scheduledRaw) : null;

  if (
    !groupId ||
    (!homeTeamId && !homePlaceholder) ||
    (!awayTeamId && !awayPlaceholder) ||
    !scheduledAt ||
    Number.isNaN(scheduledAt.getTime())
  ) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        groupId: groupId ? undefined : "Falta el grupo.",
        homeTeamId:
          homeTeamId || homePlaceholder ? undefined : "Selecciona un equipo.",
        awayTeamId:
          awayTeamId || awayPlaceholder ? undefined : "Selecciona un equipo.",
        homePlaceholder:
          homeTeamId || homePlaceholder ? undefined : "Indica un equipo.",
        awayPlaceholder:
          awayTeamId || awayPlaceholder ? undefined : "Indica un equipo.",
        scheduledAt:
          scheduledAt && !Number.isNaN(scheduledAt.getTime())
            ? undefined
            : "Indica una fecha y hora válidas.",
      },
    };
  }

  if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
    return {
      status: "error",
      message: "Selecciona dos equipos distintos.",
      fieldErrors: {
        awayTeamId: "El rival debe ser distinto.",
      },
    };
  }

  const [group] = await db
    .select({ category: tournamentGroup.category })
    .from(tournamentGroup)
    .where(eq(tournamentGroup.id, groupId))
    .limit(1);

  if (!group) {
    return {
      status: "error",
      message: "El grupo no existe.",
      fieldErrors: { groupId: "El grupo no existe." },
    };
  }

  const selectedTeamIds = [homeTeamId, awayTeamId].filter(Boolean) as string[];
  const groupTeams =
    selectedTeamIds.length === 0
      ? []
      : await db
          .select({ id: tournamentGroupTeam.teamId })
          .from(tournamentGroupTeam)
          .where(
            and(
              eq(tournamentGroupTeam.groupId, groupId),
              inArray(tournamentGroupTeam.teamId, selectedTeamIds),
            ),
          );

  if (groupTeams.length !== selectedTeamIds.length) {
    return {
      status: "error",
      message: "Selecciona equipos del grupo.",
      fieldErrors: {
        homeTeamId: "El equipo debe pertenecer al grupo.",
        awayTeamId: "El equipo debe pertenecer al grupo.",
      },
    };
  }

  if (await hasScheduleConflict(scheduledAt)) {
    return SCHEDULE_CONFLICT_STATE;
  }

  // Results (status + score) are set in a dedicated view, not here.
  await db.insert(match).values({
    category: group.category,
    groupId,
    homeTeamId,
    awayTeamId,
    homePlaceholder,
    awayPlaceholder,
    scheduledAt,
  });

  revalidatePath(GROUP_DETAIL_PATH, "page");
  await syncBracket(group.category);
  return { status: "success", message: "Partido programado." };
}

export async function updateGroupMatch(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const id = readString(formData, "id");
  const groupId = readString(formData, "groupId");
  const homeTeamId = readNullableString(formData, "homeTeamId");
  const awayTeamId = readNullableString(formData, "awayTeamId");
  const homePlaceholder = readNullableString(formData, "homePlaceholder");
  const awayPlaceholder = readNullableString(formData, "awayPlaceholder");
  const scheduledRaw = readString(formData, "scheduledAt");
  const scheduledAt = scheduledRaw ? parseMadridDateTime(scheduledRaw) : null;

  if (
    !id ||
    !groupId ||
    (!homeTeamId && !homePlaceholder) ||
    (!awayTeamId && !awayPlaceholder) ||
    !scheduledAt ||
    Number.isNaN(scheduledAt.getTime())
  ) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        groupId: groupId ? undefined : "Falta el grupo.",
        homeTeamId:
          homeTeamId || homePlaceholder ? undefined : "Selecciona un equipo.",
        awayTeamId:
          awayTeamId || awayPlaceholder ? undefined : "Selecciona un equipo.",
        homePlaceholder:
          homeTeamId || homePlaceholder ? undefined : "Indica un equipo.",
        awayPlaceholder:
          awayTeamId || awayPlaceholder ? undefined : "Indica un equipo.",
        scheduledAt:
          scheduledAt && !Number.isNaN(scheduledAt.getTime())
            ? undefined
            : "Indica una fecha y hora válidas.",
      },
    };
  }

  if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
    return {
      status: "error",
      message: "Selecciona dos equipos distintos.",
      fieldErrors: {
        awayTeamId: "El rival debe ser distinto.",
      },
    };
  }

  const selectedTeamIds = [homeTeamId, awayTeamId].filter(Boolean) as string[];
  const groupTeams =
    selectedTeamIds.length === 0
      ? []
      : await db
          .select({ id: tournamentGroupTeam.teamId })
          .from(tournamentGroupTeam)
          .where(
            and(
              eq(tournamentGroupTeam.groupId, groupId),
              inArray(tournamentGroupTeam.teamId, selectedTeamIds),
            ),
          );

  if (groupTeams.length !== selectedTeamIds.length) {
    return {
      status: "error",
      message: "Selecciona equipos del grupo.",
      fieldErrors: {
        homeTeamId: "El equipo debe pertenecer al grupo.",
        awayTeamId: "El equipo debe pertenecer al grupo.",
      },
    };
  }

  if (await hasScheduleConflict(scheduledAt, id)) {
    return SCHEDULE_CONFLICT_STATE;
  }

  // Results (status + score) are managed elsewhere; only scheduling is edited here.
  const [updatedMatch] = await db
    .update(match)
    .set({
      homeTeamId,
      awayTeamId,
      homePlaceholder,
      awayPlaceholder,
      scheduledAt,
    })
    .where(and(eq(match.id, id), eq(match.groupId, groupId)))
    .returning({ id: match.id, category: match.category });

  if (!updatedMatch) {
    return {
      status: "error",
      message: "El partido no existe.",
    };
  }

  revalidatePath(GROUP_DETAIL_PATH, "page");
  await syncBracket(updatedMatch.category);
  return { status: "success", message: "Partido actualizado." };
}

export async function deleteGroupMatch(formData: FormData) {
  await requireAdminWrite();

  const id = readString(formData, "id");
  const groupId = readString(formData, "groupId");

  if (!id || !groupId) return;

  await db
    .delete(match)
    .where(and(eq(match.id, id), eq(match.groupId, groupId)));

  revalidatePath(GROUP_DETAIL_PATH, "page");
}
