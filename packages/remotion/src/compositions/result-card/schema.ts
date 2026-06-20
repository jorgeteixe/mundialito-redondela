import { z } from "zod";

/**
 * Image template: a square match-result card. Static (no animation) — rendered as
 * a single still by the worker via renderStill.
 */
export const resultCardSchema = z.object({
  homeTeam: z.string(),
  awayTeam: z.string(),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  category: z.string(),
});

export type ResultCardProps = z.infer<typeof resultCardSchema>;
