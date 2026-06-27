import { z } from "zod";

const categorySchema = z.enum(["senior", "cadet"]);

export const groupStandingsSchema = z.object({
  /** Small label above the group name, e.g. "Clasificación". */
  eyebrow: z.string().optional(),
  groupName: z.string(),
  phase: z.string().optional(),
  category: categorySchema.optional(),
  categoryLabel: z.string().optional(),
  venue: z.string().optional(),
  qualifyCount: z.number().int().min(0).max(8).optional(),
  rows: z
    .array(
      z.object({
        teamId: z.string(),
        teamName: z.string(),
        played: z.number().int().min(0),
        wins: z.number().int().min(0),
        draws: z.number().int().min(0),
        losses: z.number().int().min(0),
        goalsFor: z.number().int().min(0),
        goalsAgainst: z.number().int().min(0),
        goalDifference: z.number().int(),
        points: z.number().int().min(0),
      }),
    )
    .min(1)
    .max(8),
});

export type GroupStandingsProps = z.infer<typeof groupStandingsSchema>;
