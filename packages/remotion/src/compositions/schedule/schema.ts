import { z } from "zod";

export const scheduleSchema = z.object({
  /** Human date label, e.g. "Lunes 29 de junio". */
  date: z.string(),
  matches: z
    .array(
      z.object({
        time: z.string(),
        home: z.string(),
        away: z.string(),
        category: z.string().optional(),
      }),
    )
    .min(1)
    .max(6),
});

export type ScheduleProps = z.infer<typeof scheduleSchema>;
