import { z } from "zod";

/**
 * Social templates expose a single `variant` toggle ("light" vs "filled") so both
 * directions can be A/B rendered via `--props`. Optional with a default so the
 * worker/backstage (which pass no inputs) still get a finished image.
 */
export const socialSchema = z.object({
  variant: z.enum(["light", "filled"]).default("filled"),
});

export type SocialProps = z.infer<typeof socialSchema>;
