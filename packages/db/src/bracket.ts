// Hardcoded tournament bracket for this single event.
//
// The whole advancement graph lives here as literal data: every F2 group match
// and every knockout match declares where each of its two teams comes from
// (a finishing position in a group, a cross-group ranking, or the
// winner/loser of another match). The seed builds DB rows from this, and the
// bracket resolver (apps/backstage/lib/bracket-resolver.ts) reads the same
// definition to fill in real teams as results come in.
//
// This is intentionally not a generic, user-editable system — it is a
// throwaway app for one tournament. To change the bracket, edit this file.

export type BracketCategory = "senior" | "cadet";

/** Where a single match slot (home or away) gets its team from. */
export type BracketSlot =
  // Nth place of a specific group (F1 or F2), e.g. 1st of F1 "Grupo A".
  | { from: "group"; stage: "f1" | "f2"; group: string; pos: number }
  // Cross-group ranking among same-position finishers of a stage,
  // e.g. "Mejor 1.º" = best 1st place (pos 1, rank 1); "Peor 1.º" = worst 1st.
  | { from: "rank"; stage: "f1" | "f2"; pos: number; rank: number }
  // Winner/loser of another bracket match, referenced by its code.
  | { from: "match"; code: string; outcome: "winner" | "loser" };

export type BracketMatchKind = "group" | "semifinal" | "third_place" | "final";

export type BracketMatch = {
  /** Stable id stored on the match row; unique across the whole tournament. */
  code: string;
  category: BracketCategory;
  kind: BracketMatchKind;
  /** F2 group this match belongs to (avatarLabel). Only for kind "group". */
  groupLabel?: string;
  date: string; // default schedule date (YYYY-MM-DD), admin can edit later
  time: string; // default schedule time (HH:mm)
  home: BracketSlot;
  away: BracketSlot;
};

const ordinal = (pos: number) => `${pos}.º`;

/** Human label for a slot, used as the placeholder shown until it resolves. */
export function slotLabel(
  slot: BracketSlot,
  category: BracketCategory,
): string {
  const cat = category === "senior" ? "Senior" : "Cadete";
  if (slot.from === "group") {
    const stageSuffix = slot.stage === "f2" ? ` ${cat} F2` : "";
    return `${ordinal(slot.pos)} Grupo ${slot.group}${stageSuffix}`;
  }
  if (slot.from === "rank") {
    const base = ordinal(slot.pos);
    const stage = slot.stage === "f2" ? `${cat} F2` : `${cat} F1`;
    if (slot.rank === 1) return `Mejor ${base} ${stage}`;
    return `${ordinal(slot.rank)} mejor ${base} ${stage}`;
  }
  // match outcome — label resolved against the referenced match's metadata.
  const word = slot.outcome === "winner" ? "Ganador" : "Perdedor";
  return `${word} de ${slot.code}`;
}

// Running per-category counter for F2 match codes (see fg below).
const f2Counter: Record<string, number> = {};

// F2 group round-robins. Slots reference F1 finishing positions; the F2 group
// (groupLabel) is which F2 pool the match belongs to.
const SENIOR_F2: BracketMatch[] = [
  // Viernes 10 julio
  fg("senior", "A", "2026-07-10", "21:30", g("f1", "A", 1), g("f1", "B", 2)),
  fg("senior", "B", "2026-07-10", "22:00", g("f1", "B", 1), g("f1", "D", 2)),
  fg("senior", "C", "2026-07-10", "22:30", g("f1", "C", 1), g("f1", "A", 2)),
  // Martes 14 julio
  fg("senior", "D", "2026-07-14", "21:30", g("f1", "D", 1), g("f1", "C", 2)),
  fg("senior", "A", "2026-07-14", "22:00", g("f1", "A", 1), g("f1", "C", 3)),
  fg("senior", "B", "2026-07-14", "22:30", g("f1", "B", 1), g("f1", "A", 3)),
  // Miércoles 15 julio
  fg("senior", "C", "2026-07-15", "21:30", g("f1", "C", 1), g("f1", "D", 3)),
  fg("senior", "D", "2026-07-15", "22:00", g("f1", "D", 1), g("f1", "B", 3)),
  fg("senior", "A", "2026-07-15", "22:30", g("f1", "B", 2), g("f1", "C", 3)),
  // Jueves 16 julio
  fg("senior", "B", "2026-07-16", "21:30", g("f1", "D", 2), g("f1", "A", 3)),
  fg("senior", "C", "2026-07-16", "22:00", g("f1", "A", 2), g("f1", "D", 3)),
  fg("senior", "D", "2026-07-16", "22:30", g("f1", "C", 2), g("f1", "B", 3)),
];

const CADET_F2: BracketMatch[] = [
  // Viernes 10 julio
  fg("cadet", "A", "2026-07-10", "20:00", g("f1", "A", 1), g("f1", "B", 2)),
  fg("cadet", "B", "2026-07-10", "20:30", g("f1", "B", 1), g("f1", "A", 3)),
  fg("cadet", "C", "2026-07-10", "21:00", g("f1", "C", 1), g("f1", "B", 3)),
  // Martes 14 julio
  fg("cadet", "A", "2026-07-14", "20:00", g("f1", "A", 1), g("f1", "C", 3)),
  fg("cadet", "B", "2026-07-14", "20:30", g("f1", "B", 1), g("f1", "C", 2)),
  fg("cadet", "C", "2026-07-14", "21:00", g("f1", "C", 1), g("f1", "A", 2)),
  // Miércoles 15 julio
  fg("cadet", "A", "2026-07-15", "20:00", g("f1", "B", 2), g("f1", "C", 3)),
  fg("cadet", "B", "2026-07-15", "20:30", g("f1", "A", 3), g("f1", "C", 2)),
  fg("cadet", "C", "2026-07-15", "21:00", g("f1", "B", 3), g("f1", "A", 2)),
];

const SENIOR_KO: BracketMatch[] = [
  ko(
    "senior",
    "semifinal",
    "senior-sf-1",
    "2026-07-20",
    "21:30",
    g("f2", "A", 1),
    g("f2", "D", 1),
  ),
  ko(
    "senior",
    "semifinal",
    "senior-sf-2",
    "2026-07-20",
    "22:00",
    g("f2", "B", 1),
    g("f2", "C", 1),
  ),
  ko(
    "senior",
    "third_place",
    "senior-3rd",
    "2026-07-24",
    "20:30",
    m("senior-sf-1", "loser"),
    m("senior-sf-2", "loser"),
  ),
  ko(
    "senior",
    "final",
    "senior-final",
    "2026-07-24",
    "22:00",
    m("senior-sf-1", "winner"),
    m("senior-sf-2", "winner"),
  ),
];

const CADET_KO: BracketMatch[] = [
  ko(
    "cadet",
    "semifinal",
    "cadet-sf-1",
    "2026-07-20",
    "20:00",
    r("f2", 1, 1),
    r("f2", 1, 2),
  ),
  ko(
    "cadet",
    "semifinal",
    "cadet-sf-2",
    "2026-07-20",
    "20:30",
    r("f2", 1, 3),
    r("f2", 2, 1),
  ),
  ko(
    "cadet",
    "third_place",
    "cadet-3rd",
    "2026-07-24",
    "20:00",
    m("cadet-sf-1", "loser"),
    m("cadet-sf-2", "loser"),
  ),
  ko(
    "cadet",
    "final",
    "cadet-final",
    "2026-07-24",
    "21:30",
    m("cadet-sf-1", "winner"),
    m("cadet-sf-2", "winner"),
  ),
];

export const BRACKET: BracketMatch[] = [
  ...SENIOR_F2,
  ...CADET_F2,
  ...SENIOR_KO,
  ...CADET_KO,
];

export function bracketForCategory(category: BracketCategory): BracketMatch[] {
  return BRACKET.filter((m) => m.category === category);
}

export function bracketByCode(): Map<string, BracketMatch> {
  return new Map(BRACKET.map((m) => [m.code, m]));
}

// --- tiny constructors (keep the tables above readable) ---

function g(stage: "f1" | "f2", group: string, pos: number): BracketSlot {
  return { from: "group", stage, group, pos };
}

function r(stage: "f1" | "f2", pos: number, rank: number): BracketSlot {
  return { from: "rank", stage, pos, rank };
}

function m(code: string, outcome: "winner" | "loser"): BracketSlot {
  return { from: "match", code, outcome };
}

// F2 group match. Code derived per category + group + a running index.
function fg(
  category: BracketCategory,
  groupLabel: string,
  date: string,
  time: string,
  home: BracketSlot,
  away: BracketSlot,
): BracketMatch {
  const key = `${category}`;
  f2Counter[key] = (f2Counter[key] ?? 0) + 1;
  const code = `${category}-f2-${String(f2Counter[key]).padStart(2, "0")}`;
  return { code, category, kind: "group", groupLabel, date, time, home, away };
}

function ko(
  category: BracketCategory,
  kind: BracketMatchKind,
  code: string,
  date: string,
  time: string,
  home: BracketSlot,
  away: BracketSlot,
): BracketMatch {
  return { code, category, kind, date, time, home, away };
}
