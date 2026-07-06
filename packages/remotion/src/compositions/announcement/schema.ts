import { z } from "zod";

/**
 * Generic announcement / news reel. Deliberately minimal: a single free-text
 * message shown big and animated over the branded canvas. `eyebrow` is a small
 * label above the message; it defaults to "Aviso" and is not exposed as an
 * editable field so the template stays a one-input template.
 */
export const announcementSchema = z.object({
  /** Small label above the message, e.g. "Aviso". */
  eyebrow: z.string().optional(),
  /** The message itself, e.g. "Partidos pospuestos por lluvia". */
  text: z.string().min(1),
});

export type AnnouncementProps = z.infer<typeof announcementSchema>;
