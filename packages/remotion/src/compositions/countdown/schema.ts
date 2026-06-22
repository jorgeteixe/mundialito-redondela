import { z } from "zod";

/**
 * Daily countdown reel: a single integer driving the hero number. Set manually
 * per render in backstage. 0 = kickoff day ("¡HOY EMPIEZA!").
 */
export const countdownSchema = z.object({
  daysLeft: z.number().int().min(0),
});

export type CountdownProps = z.infer<typeof countdownSchema>;
