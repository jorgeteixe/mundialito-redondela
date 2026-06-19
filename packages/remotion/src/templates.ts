import type { z } from "zod";
import { PRESETS, type PresetName } from "./presets";
import { helloWorldSchema } from "./compositions/hello-world/schema";

export type TemplateDefinition = {
  id: string;
  title: string;
  kind: "video" | "image";
  preset: PresetName;
  durationInFrames: number;
  schema: z.ZodObject;
  defaultProps: Record<string, unknown>;
};

function defineTemplateDefinition<S extends z.ZodObject>(template: {
  id: string;
  title: string;
  kind: "video" | "image";
  preset: PresetName;
  durationInFrames?: number;
  schema: S;
  defaultProps: z.infer<S>;
}): TemplateDefinition {
  return {
    ...template,
    durationInFrames:
      template.durationInFrames ?? PRESETS[template.preset].durationInFrames,
  };
}

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  defineTemplateDefinition({
    id: "hello-world",
    title: "Hello World",
    kind: "video",
    preset: "story",
    schema: helloWorldSchema,
    defaultProps: { title: "Mundialito Redondela" },
  }),
  // schedule / result / goal templates are built but parked for now.
  // Re-enable by adding template definitions here and matching Components in
  // registry.ts.
];
