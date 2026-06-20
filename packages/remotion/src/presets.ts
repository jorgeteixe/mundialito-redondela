/**
 * Size presets shared by every composition. A template references a preset by key;
 * Root.tsx reads width/height/fps from here when registering each <Composition>.
 */
export type Preset = {
  width: number;
  height: number;
  fps: number;
  /** Sensible default length; a template may override per entry in the registry. */
  durationInFrames: number;
};

export const PRESETS = {
  story: { width: 1080, height: 1920, fps: 30, durationInFrames: 150 },
  square: { width: 1080, height: 1080, fps: 30, durationInFrames: 150 },
  landscape: { width: 1920, height: 1080, fps: 30, durationInFrames: 150 },
  // Image-only social presets (fps/duration unused for stills). Sizes follow the
  // platforms' recommended upload dimensions.
  "instagram-profile": {
    width: 320,
    height: 320,
    fps: 30,
    durationInFrames: 1,
  },
  "facebook-profile": { width: 320, height: 320, fps: 30, durationInFrames: 1 },
  "facebook-cover": { width: 851, height: 315, fps: 30, durationInFrames: 1 },
} as const satisfies Record<string, Preset>;

export type PresetName = keyof typeof PRESETS;
