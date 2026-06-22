import type { z } from "zod";
import { PRESETS, type PresetName } from "./presets";
import { countdownSchema } from "./compositions/countdown/schema";
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
    id: "countdown-post",
    title: "Cuenta atrás · Post (cuadrado)",
    kind: "image",
    preset: "square",
    // 1 frame → rendered via renderStill and shown as a still in Studio.
    durationInFrames: 1,
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
