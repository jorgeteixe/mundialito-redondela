import { z } from "zod";

/** A team and its score — shared by the result and goal templates. */
export const teamScoreSchema = z.object({
  name: z.string(),
  score: z.number().int().min(0),
});

export type TeamScore = z.infer<typeof teamScoreSchema>;
