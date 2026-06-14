import type { ComponentType } from "react";
import type { z } from "zod";
import { PRESETS, type PresetName } from "./presets";
import { HelloWorld } from "./compositions/hello-world/Component";
import { helloWorldSchema } from "./compositions/hello-world/schema";

/**
 * A single template definition — the unit both Remotion Studio and (later) the
 * backstage <Player> + worker iterate over. Add one entry here and the template
 * shows up everywhere; no per-template wiring in three places.
 */
export type Template = {
  id: string;
  title: string;
  kind: "video" | "image";
  preset: PresetName;
  /** Defaults to the preset's durationInFrames when omitted. */
  durationInFrames: number;
  schema: z.ZodObject;
  Component: ComponentType<Record<string, unknown>>;
  defaultProps: Record<string, unknown>;
};

/**
 * Ties `schema`, `Component` props, and `defaultProps` together at the call site
 * so a mismatch is a type error. Returns a widened `Template` for the array.
 */
function defineTemplate<S extends z.ZodObject>(t: {
  id: string;
  title: string;
  kind: "video" | "image";
  preset: PresetName;
  durationInFrames?: number;
  schema: S;
  Component: ComponentType<z.infer<S>>;
  defaultProps: z.infer<S>;
}): Template {
  return {
    ...t,
    durationInFrames: t.durationInFrames ?? PRESETS[t.preset].durationInFrames,
  } as unknown as Template;
}

export const TEMPLATES: Template[] = [
  defineTemplate({
    id: "hello-world",
    title: "Hello World",
    kind: "video",
    preset: "story",
    schema: helloWorldSchema,
    Component: HelloWorld,
    defaultProps: { title: "Mundialito Redondela" },
  }),
  // schedule / result / goal templates are built but parked for now.
  // Re-enable by importing their Component + schema and adding defineTemplate
  // entries here (see git history / src/compositions/{schedule,result,goal}).
];
