import { z } from "zod";
import { teamScoreSchema } from "../../schemas";

export const resultSchema = z.object({
  home: teamScoreSchema,
  away: teamScoreSchema,
  /** Optional context line, e.g. "Fase de grupos · Jornada 3". */
  note: z.string().optional(),
});

export type ResultProps = z.infer<typeof resultSchema>;
