// Pure parsing/validation for match-result entry, kept framework-free so it can
// be unit-tested without FormData or a DB.

export type ParsedScore = { value: number | null; error?: string };

export function parseScore(raw: string): ParsedScore {
  const trimmed = raw.trim();
  if (trimmed === "") return { value: null };
  if (!/^\d+$/.test(trimmed)) {
    return { value: null, error: "Usa un número entero." };
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (parsed > 99) {
    return { value: null, error: "Máximo 99." };
  }
  return { value: parsed };
}

export type ScorePairResult = {
  homeValue: number | null;
  awayValue: number | null;
  fieldErrors: { home?: string; away?: string };
  hasError: boolean;
};

// A home/away pair must be both filled or both empty; surfaces any per-field
// parse error alongside the "fill both" rule.
export function resolveScorePair(
  homeRaw: string,
  awayRaw: string,
  bothLabel: string,
): ScorePairResult {
  const home = parseScore(homeRaw);
  const away = parseScore(awayRaw);

  const fieldErrors: { home?: string; away?: string } = {};
  if (home.error) fieldErrors.home = home.error;
  if (away.error) fieldErrors.away = away.error;

  const oneFilled =
    !home.error &&
    !away.error &&
    (home.value !== null) !== (away.value !== null);
  if (oneFilled) {
    fieldErrors.home = bothLabel;
    fieldErrors.away = bothLabel;
  }

  return {
    homeValue: home.value,
    awayValue: away.value,
    fieldErrors,
    hasError: Boolean(fieldErrors.home || fieldErrors.away),
  };
}
