// Public, side-effect-free surface for consumers (backstage <Player>, worker).
// Importing this must NOT call registerRoot — that lives in remotion-entry.ts.
export { PRESETS, type Preset, type PresetName } from "./presets";
export { TEMPLATES, type Template } from "./registry";
export { RemotionRoot } from "./Root";
export { TOURNAMENT } from "./tournament";
export * as theme from "./theme";

// Compositions + their schemas/types
export { HelloWorld } from "./compositions/hello-world/Component";
export {
  helloWorldSchema,
  type HelloWorldProps,
} from "./compositions/hello-world/schema";

export { Schedule } from "./compositions/schedule/Component";
export {
  scheduleSchema,
  type ScheduleProps,
} from "./compositions/schedule/schema";

export { Result } from "./compositions/result/Component";
export { resultSchema, type ResultProps } from "./compositions/result/schema";

export { Goal } from "./compositions/goal/Component";
export { goalSchema, type GoalProps } from "./compositions/goal/schema";

export { teamScoreSchema, type TeamScore } from "./schemas";
