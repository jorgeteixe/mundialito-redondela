import type { z } from "zod";
import { PRESETS, type PresetName } from "./presets";
import { helloWorldSchema } from "./compositions/hello-world/schema";
import { countdownSchema } from "./compositions/countdown/schema";
import { resultCardSchema } from "./compositions/result-card/schema";
import { socialSchema } from "./compositions/dummy/schema";

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
    id: "countdown",
    title: "Cuenta atrás (reel diario)",
    kind: "video",
    preset: "story",
    schema: countdownSchema,
    parameters: [
      {
        name: "daysLeft",
        label: "Días restantes",
        description: "Días que faltan para el inicio. 0 = ¡hoy empieza!",
        type: "integer",
        required: true,
        min: 0,
      },
    ],
    defaultProps: { daysLeft: 7 },
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
  defineTemplateDefinition({
    id: "instagram-profile",
    title: "Instagram · Perfil (320×320)",
    kind: "image",
    preset: "instagram-profile",
    schema: socialSchema,
    parameters: [],
    defaultProps: { variant: "light" },
  }),
  defineTemplateDefinition({
    id: "facebook-profile",
    title: "Facebook · Perfil (320×320)",
    kind: "image",
    preset: "facebook-profile",
    schema: socialSchema,
    parameters: [],
    defaultProps: { variant: "light" },
  }),
  defineTemplateDefinition({
    id: "facebook-cover",
    title: "Facebook · Portada (851×315)",
    kind: "image",
    preset: "facebook-cover",
    schema: socialSchema,
    parameters: [],
    defaultProps: { variant: "light" },
  }),
  defineTemplateDefinition({
    id: "og-share",
    title: "Open Graph · Compartir (1200×630)",
    kind: "image",
    preset: "og-share",
    schema: socialSchema,
    parameters: [],
    defaultProps: { variant: "light" },
  }),
  // schedule / result / goal templates are built but parked for now.
  // Re-enable by adding template definitions here and matching Components in
  // registry.ts.
];
