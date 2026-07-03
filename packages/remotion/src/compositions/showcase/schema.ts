import { z } from "zod";

export const showcaseSchema = z.object({
  /** Hook line of the cold open; sentences are revealed one by one. */
  tagline: z.string(),
});

export type ShowcaseProps = z.infer<typeof showcaseSchema>;

/**
 * Scene timeline (30 fps) for the launch story — see the storytelling plan:
 * Act 1 "the before" → Act 2 "the honest turn" → Act 3 zero-touch loop
 * (climax, ~46% of runtime) → Act 4 proof + close.
 * Exported so templates.ts registers a duration that always matches.
 */
export const SHOWCASE_SCENES = {
  coldOpen: { from: 0, duration: 120 },
  paper: { from: 120, duration: 150 },
  relay: { from: 270, duration: 120 },
  turnWant: { from: 390, duration: 90 },
  turnInsight: { from: 480, duration: 90 },
  loop: { from: 570, duration: 780 },
  breadth: { from: 1350, duration: 150 },
  close: { from: 1500, duration: 180 },
} as const;

/** Sub-beats of the zero-touch loop, relative to SHOWCASE_SCENES.loop.from. */
export const LOOP_BEATS = {
  chat: { from: 0, duration: 180 },
  confirm: { from: 180, duration: 150 },
  core: { from: 330, duration: 150 },
  render: { from: 480, duration: 150 },
  publish: { from: 630, duration: 150 },
} as const;

export const SHOWCASE_DURATION_IN_FRAMES =
  SHOWCASE_SCENES.close.from + SHOWCASE_SCENES.close.duration;
