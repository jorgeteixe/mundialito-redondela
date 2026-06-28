import type { PublicCalendarMatch } from "@mr/db";
import { validateResultInput } from "@mr/tournament";

// Pure match-resolution logic, kept DB-free so it can be unit-tested. The tool
// in tools.ts feeds it the result of listPublicMatches().

export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function commonPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let i = 0;
  while (i < max && a[i] === b[i]) i += 1;
  return i;
}

/** 0 = no match, 3 = exact, 2 = substring, 1 = token overlap. */
export function nameScore(name: string, guess: string): number {
  const n = normalizeName(name);
  const g = normalizeName(guess);
  if (!g || !n) return 0;
  if (n === g) return 3;
  if (n.includes(g) || g.includes(n)) return 2;
  // Token overlap, tolerating nicknames that share a prefix ("barca"↔"barcelona").
  const guessTokens = g.split(" ");
  const nameTokens = n.split(" ");
  const overlap = guessTokens.some((gt) =>
    nameTokens.some((nt) => nt === gt || commonPrefixLength(nt, gt) >= 4),
  );
  return overlap ? 1 : 0;
}

const MADRID = "Europe/Madrid";

export function madridDayKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MADRID,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function madridTime(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: MADRID,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** e.g. "lunes 29 de junio" — for confirming the right fixture. */
export function madridDateLabel(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: MADRID,
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(new Date(iso))
    .replace(",", "");
}

export function isPlayed(match: PublicCalendarMatch): boolean {
  return match.homeScore !== null && match.awayScore !== null;
}

function trailingId(channelId: string): string {
  const idx = channelId.lastIndexOf(":");
  return idx >= 0 ? channelId.slice(idx + 1) : channelId;
}

/** The bot only acts in the single configured group; everything else is dropped. */
export function isAllowedChannel(channelId: string, groupId: string): boolean {
  return channelId === groupId || trailingId(channelId) === trailingId(groupId);
}

export type ResolveInput = {
  teamA: string;
  scoreA: number;
  teamB: string;
  scoreB: number;
  penaltiesA?: number | null;
  penaltiesB?: number | null;
  dayHint?: string | null;
};

type Orientation = {
  valid: boolean;
  score: number;
  homeScore: number;
  awayScore: number;
  homePenalties: number | null;
  awayPenalties: number | null;
};

function orientationFor(
  match: PublicCalendarMatch,
  input: ResolveInput,
): Orientation {
  const penA = input.penaltiesA ?? null;
  const penB = input.penaltiesB ?? null;

  // Orientation 1: teamA is the fixture's home side.
  const aHome = nameScore(match.homeTeamName, input.teamA);
  const bAway = nameScore(match.awayTeamName, input.teamB);
  const o1 = {
    valid: aHome > 0 && bAway > 0,
    score: aHome + bAway,
    homeScore: input.scoreA,
    awayScore: input.scoreB,
    homePenalties: penA,
    awayPenalties: penB,
  };

  // Orientation 2: teamA is the fixture's away side (user named them reversed).
  const bHome = nameScore(match.homeTeamName, input.teamB);
  const aAway = nameScore(match.awayTeamName, input.teamA);
  const o2 = {
    valid: bHome > 0 && aAway > 0,
    score: bHome + aAway,
    homeScore: input.scoreB,
    awayScore: input.scoreA,
    homePenalties: penB,
    awayPenalties: penA,
  };

  if (o1.valid && (!o2.valid || o1.score >= o2.score)) return o1;
  if (o2.valid) return o2;
  return { ...o1, valid: false };
}

export type ResolvedCandidate = {
  matchId: string;
  kind: PublicCalendarMatch["kind"];
  category: PublicCalendarMatch["category"];
  groupName: string | null;
  homeName: string;
  awayName: string;
  scheduledAt: string;
  played: boolean;
  score: number;
  orientation: Orientation;
};

export type ResolveOutcome =
  | {
      ok: true;
      matchId: string;
      kind: PublicCalendarMatch["kind"];
      category: PublicCalendarMatch["category"];
      groupName: string | null;
      homeName: string;
      awayName: string;
      time: string;
      dateLabel: string;
      homeScore: number;
      awayScore: number;
      homePenalties: number | null;
      awayPenalties: number | null;
      alreadyHadResult: boolean;
    }
  | {
      ok: false;
      warning:
        | "not-found"
        | "ambiguous"
        | "needs-penalties"
        | "penalties-not-allowed"
        | "penalties-not-level"
        | "invalid";
      message: string;
      candidates?: {
        matchId: string;
        homeName: string;
        awayName: string;
        time: string;
        kind: PublicCalendarMatch["kind"];
      }[];
    };

/**
 * Resolve a free-text result ("teamA scoreA, teamB scoreB") to a single fixture,
 * orienting the scores to the fixture's home/away sides and validating the
 * penalty rules. Read-only; never mutates anything.
 */
export function resolveMatch(
  matches: PublicCalendarMatch[],
  input: ResolveInput,
): ResolveOutcome {
  const candidates: ResolvedCandidate[] = [];
  for (const match of matches) {
    if (input.dayHint && madridDayKey(match.scheduledAt) !== input.dayHint) {
      continue;
    }
    const orientation = orientationFor(match, input);
    if (!orientation.valid) continue;
    candidates.push({
      matchId: match.id,
      kind: match.kind,
      category: match.category,
      groupName: match.groupName,
      homeName: match.homeTeamName,
      awayName: match.awayTeamName,
      scheduledAt: match.scheduledAt,
      played: isPlayed(match),
      score: orientation.score,
      orientation,
    });
  }

  if (candidates.length === 0) {
    return {
      ok: false,
      warning: "not-found",
      message:
        "No encuentro ese partido. Pide el horario del día para ver los nombres exactos.",
    };
  }

  // Prefer the unplayed fixture, then the strongest name match, then the
  // earliest kickoff. This picks the obvious pending game when a team appears
  // in several fixtures.
  candidates.sort(
    (a, b) =>
      Number(a.played) - Number(b.played) ||
      b.score - a.score ||
      a.scheduledAt.localeCompare(b.scheduledAt),
  );

  const top = candidates[0]!;
  const second = candidates[1];
  if (
    second &&
    top.played === second.played &&
    top.score === second.score &&
    top.matchId !== second.matchId
  ) {
    return {
      ok: false,
      warning: "ambiguous",
      message:
        "Hay más de un partido que encaja. ¿A cuál te refieres? Indica el día o la hora.",
      candidates: candidates.slice(0, 4).map((c) => ({
        matchId: c.matchId,
        homeName: c.homeName,
        awayName: c.awayName,
        time: madridTime(c.scheduledAt),
        kind: c.kind,
      })),
    };
  }

  const { orientation } = top;
  const validation = validateResultInput({
    kind: top.kind,
    homeScore: orientation.homeScore,
    awayScore: orientation.awayScore,
    homePenalties: orientation.homePenalties,
    awayPenalties: orientation.awayPenalties,
  });
  if (!validation.ok) {
    const warning =
      validation.code === "penalties-not-allowed-group"
        ? "penalties-not-allowed"
        : validation.code === "penalties-not-level"
          ? "penalties-not-level"
          : "invalid";
    return { ok: false, warning, message: validation.message };
  }

  // Knockouts that finish level must record the shootout — ask for it instead
  // of saving an undecided result.
  const isKnockout = top.kind !== "group";
  const level = orientation.homeScore === orientation.awayScore;
  const missingPenalties =
    orientation.homePenalties === null || orientation.awayPenalties === null;
  if (isKnockout && level && missingPenalties) {
    return {
      ok: false,
      warning: "needs-penalties",
      message:
        "Es un partido de eliminatoria y acabó en empate. Necesito el resultado de los penaltis por separado.",
    };
  }

  return {
    ok: true,
    matchId: top.matchId,
    kind: top.kind,
    category: top.category,
    groupName: top.groupName,
    homeName: top.homeName,
    awayName: top.awayName,
    time: madridTime(top.scheduledAt),
    dateLabel: madridDateLabel(top.scheduledAt),
    homeScore: orientation.homeScore,
    awayScore: orientation.awayScore,
    homePenalties: orientation.homePenalties,
    awayPenalties: orientation.awayPenalties,
    alreadyHadResult: top.played,
  };
}
