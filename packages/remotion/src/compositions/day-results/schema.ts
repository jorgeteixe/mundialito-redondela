import { z } from "zod";

const categorySchema = z.enum(["senior", "cadet"]);

export const dailyResultsSchema = z.object({
  /** Small label above the date, e.g. "Resultados de hoy". */
  eyebrow: z.string().optional(),
  /** Human date label, e.g. "Lunes 29 de junio". */
  date: z.string(),
  /** Optional venue/footer line. */
  venue: z.string().optional(),
  matches: z
    .array(
      z.object({
        time: z.string().optional(),
        home: z.string(),
        away: z.string(),
        homeScore: z.number().int().min(0),
        awayScore: z.number().int().min(0),
        homePenaltyScore: z.number().int().min(0).optional(),
        awayPenaltyScore: z.number().int().min(0).optional(),
        category: categorySchema.optional(),
        categoryLabel: z.string().optional(),
        group: z.string().optional(),
      }),
    )
    .min(1)
    .max(6),
});

export type DailyResultsProps = z.infer<typeof dailyResultsSchema>;
