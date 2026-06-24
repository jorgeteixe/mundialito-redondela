/** Every match occupies the single shared field for a fixed 30-minute slot. */
export const MATCH_DURATION_MINUTES = 30;
export const MATCH_DURATION_MS = MATCH_DURATION_MINUTES * 60 * 1000;

/**
 * The field is shared across categories (cadet plays before senior), so two
 * matches conflict when their 30-minute slots overlap. Back-to-back slots that
 * are exactly 30 minutes apart do NOT conflict.
 */
export function matchesConflict(aStart: Date, bStart: Date): boolean {
  return Math.abs(aStart.getTime() - bStart.getTime()) < MATCH_DURATION_MS;
}

/**
 * Open interval `(start - 30min, start + 30min)` used to find conflicting
 * matches in the DB. A match starting on either bound is exactly one slot away
 * and does not conflict.
 */
export function conflictWindow(scheduledAt: Date) {
  return {
    start: new Date(scheduledAt.getTime() - MATCH_DURATION_MS),
    end: new Date(scheduledAt.getTime() + MATCH_DURATION_MS),
  };
}
