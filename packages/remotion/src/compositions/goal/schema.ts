import { z } from "zod";
import { teamScoreSchema } from "../../schemas";

export const goalSchema = z.object({
  scorer: z.string(),
  team: z.string(),
  minute: z.number().int().min(0).max(120),
  /** Scoreboard after the goal. */
  home: teamScoreSchema,
  away: teamScoreSchema,
});

export type GoalProps = z.infer<typeof goalSchema>;
