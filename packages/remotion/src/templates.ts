import type { z } from "zod";
import { PRESETS, type PresetName } from "./presets";
import { helloWorldSchema } from "./compositions/hello-world/schema";
import { resultCardSchema } from "./compositions/result-card/schema";

export type TemplateParameter = {
  name: string;
  label: string;
  description?: string;
  type: "text" | "number" | "integer" | "boolean" | "select";
  required?: boolean;
  min?: number;
  max?: number;
  options?: { label: string; value: string }[];
};

export type TemplateDefinition = {
  id: string;
  title: string;
  kind: "video" | "image";
  preset: PresetName;
  durationInFrames: number;
  schema: z.ZodObject;
  parameters: TemplateParameter[];
  defaultProps: Record<string, unknown>;
};

function defineTemplateDefinition<S extends z.ZodObject>(template: {
  id: string;
  title: string;
  kind: "video" | "image";
  preset: PresetName;
  durationInFrames?: number;
  schema: S;
  parameters: TemplateParameter[];
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
    parameters: [
      {
        name: "title",
        label: "Título",
        description: "Texto principal del vídeo.",
        type: "text",
        required: true,
      },
    ],
    defaultProps: { title: "Mundialito Redondela" },
  }),
  defineTemplateDefinition({
    id: "result-card",
    title: "Tarjeta de resultado",
    kind: "image",
    preset: "square",
    schema: resultCardSchema,
    parameters: [
      {
        name: "homeTeam",
        label: "Equipo local",
        type: "text",
        required: true,
      },
      {
        name: "awayTeam",
        label: "Equipo visitante",
        type: "text",
        required: true,
      },
      {
        name: "homeScore",
        label: "Goles local",
        type: "integer",
        required: true,
        min: 0,
      },
      {
        name: "awayScore",
        label: "Goles visitante",
        type: "integer",
        required: true,
        min: 0,
      },
      {
        name: "category",
        label: "Categoría",
        type: "text",
        required: true,
      },
    ],
    defaultProps: {
      homeTeam: "Redondela",
      awayTeam: "A Xunqueira",
      homeScore: 2,
      awayScore: 1,
      category: "Senior",
    },
  }),
  // schedule / result / goal templates are built but parked for now.
  // Re-enable by adding template definitions here and matching Components in
  // registry.ts.
];
