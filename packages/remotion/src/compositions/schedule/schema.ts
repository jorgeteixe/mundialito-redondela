import { z } from "zod";

const categorySchema = z.enum(["senior", "cadet"]);

export const scheduleSchema = z.object({
  /** Small label above the date, e.g. "Partidos de hoy". */
  eyebrow: z.string().optional(),
  /** Human date label, e.g. "Lunes 29 de junio". */
  date: z.string(),
  /** Optional venue/footer line. */
  venue: z.string().optional(),
  matches: z
    .array(
      z.object({
        time: z.string(),
        home: z.string(),
        away: z.string(),
        category: categorySchema.optional(),
        categoryLabel: z.string().optional(),
        group: z.string().optional(),
      }),
    )
    .min(1)
    .max(6),
});

export type ScheduleProps = z.infer<typeof scheduleSchema>;
