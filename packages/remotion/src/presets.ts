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
} as const satisfies Record<string, Preset>;

export type PresetName = keyof typeof PRESETS;
