import { z } from "zod";
import { teamScoreSchema } from "../../schemas";

const categorySchema = z.enum(["senior", "cadet"]);

export const matchResultStorySchema = z.object({
  eyebrow: z.string().optional(),
  home: teamScoreSchema.extend({
    penaltyScore: z.number().int().min(0).optional(),
  }),
  away: teamScoreSchema.extend({
    penaltyScore: z.number().int().min(0).optional(),
  }),
  category: categorySchema.optional(),
  categoryLabel: z.string().optional(),
  phase: z.string().optional(),
  group: z.string().optional(),
  note: z.string().optional(),
  venue: z.string().optional(),
});

export type MatchResultStoryProps = z.infer<typeof matchResultStorySchema>;
