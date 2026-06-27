import type { z } from "zod";
import { PRESETS, type PresetName } from "./presets";
import { countdownSchema } from "./compositions/countdown/schema";
import { dailyResultsSchema } from "./compositions/day-results/schema";
import { socialSchema } from "./compositions/dummy/schema";
import { groupStandingsSchema } from "./compositions/group-standings/schema";
import { matchResultStorySchema } from "./compositions/match-result-story/schema";
import { scheduleSchema } from "./compositions/schedule/schema";

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
    id: "daily-schedule",
    title: "Partidos del día (reel diario)",
    kind: "video",
    preset: "story",
    schema: scheduleSchema,
    parameters: [
      {
        name: "eyebrow",
        label: "Etiqueta",
        type: "text",
        required: false,
      },
      {
        name: "date",
        label: "Fecha",
        type: "text",
        required: true,
      },
      {
        name: "venue",
        label: "Lugar",
        type: "text",
        required: false,
      },
    ],
    defaultProps: {
      eyebrow: "Partidos de hoy",
      date: "Lunes 29 de junio",
      venue: "Pista de A Xunqueira, Redondela",
      matches: [
        {
          time: "10:00",
          home: "A Xunqueira",
          away: "Cesantes FC",
          category: "senior",
          categoryLabel: "Senior",
          group: "Grupo A",
        },
        {
          time: "11:00",
          home: "Chapela",
          away: "Vilar",
          category: "cadet",
          categoryLabel: "Cadete",
          group: "Grupo B",
        },
        {
          time: "12:00",
          home: "Redondela",
          away: "Cedeira",
          category: "senior",
          categoryLabel: "Senior",
          group: "Grupo A",
        },
        {
          time: "13:00",
          home: "Saxamonde",
          away: "Reboreda",
          category: "cadet",
          categoryLabel: "Cadete",
          group: "Grupo C",
        },
      ],
    },
  }),
  defineTemplateDefinition({
    id: "daily-schedule-post",
    title: "Partidos del día · Post (cuadrado)",
    kind: "image",
    preset: "square",
    durationInFrames: 1,
    schema: scheduleSchema,
    parameters: [
      {
        name: "eyebrow",
        label: "Etiqueta",
        type: "text",
        required: false,
      },
      {
        name: "date",
        label: "Fecha",
        type: "text",
        required: true,
      },
      {
        name: "venue",
        label: "Lugar",
        type: "text",
        required: false,
      },
    ],
    defaultProps: {
      eyebrow: "Partidos de hoy",
      date: "Lunes 29 de junio",
      venue: "Pista de A Xunqueira, Redondela",
      matches: [
        {
          time: "10:00",
          home: "A Xunqueira",
          away: "Cesantes FC",
          category: "senior",
          categoryLabel: "Senior",
          group: "Grupo A",
        },
        {
          time: "11:00",
          home: "Chapela",
          away: "Vilar",
          category: "cadet",
          categoryLabel: "Cadete",
          group: "Grupo B",
        },
        {
          time: "12:00",
          home: "Redondela",
          away: "Cedeira",
          category: "senior",
          categoryLabel: "Senior",
          group: "Grupo A",
        },
        {
          time: "13:00",
          home: "Saxamonde",
          away: "Reboreda",
          category: "cadet",
          categoryLabel: "Cadete",
          group: "Grupo C",
        },
      ],
    },
  }),
  defineTemplateDefinition({
    id: "daily-results",
    title: "Resultados del día (reel diario)",
    kind: "video",
    preset: "story",
    schema: dailyResultsSchema,
    parameters: [
      {
        name: "eyebrow",
        label: "Etiqueta",
        type: "text",
        required: false,
      },
      {
        name: "date",
        label: "Fecha",
        type: "text",
        required: true,
      },
      {
        name: "venue",
        label: "Lugar",
        type: "text",
        required: false,
      },
    ],
    defaultProps: {
      eyebrow: "Resultados de hoy",
      date: "Lunes 29 de junio",
      venue: "Pista de A Xunqueira, Redondela",
      matches: [
        {
          time: "10:00",
          home: "A Xunqueira",
          away: "Cesantes FC",
          homeScore: 2,
          awayScore: 1,
          category: "senior",
          categoryLabel: "Senior",
          group: "Grupo A",
        },
        {
          time: "11:00",
          home: "Chapela",
          away: "Vilar",
          homeScore: 0,
          awayScore: 0,
          homePenaltyScore: 4,
          awayPenaltyScore: 5,
          category: "cadet",
          categoryLabel: "Cadete",
          group: "Grupo B",
        },
        {
          time: "12:00",
          home: "Redondela",
          away: "Cedeira",
          homeScore: 3,
          awayScore: 2,
          category: "senior",
          categoryLabel: "Senior",
          group: "Grupo A",
        },
        {
          time: "13:00",
          home: "Saxamonde",
          away: "Reboreda",
          homeScore: 1,
          awayScore: 4,
          category: "cadet",
          categoryLabel: "Cadete",
          group: "Grupo C",
        },
      ],
    },
  }),
  defineTemplateDefinition({
    id: "daily-results-post",
    title: "Resultados del día · Post (cuadrado)",
    kind: "image",
    preset: "square",
    durationInFrames: 1,
    schema: dailyResultsSchema,
    parameters: [
      {
        name: "eyebrow",
        label: "Etiqueta",
        type: "text",
        required: false,
      },
      {
        name: "date",
        label: "Fecha",
        type: "text",
        required: true,
      },
      {
        name: "venue",
        label: "Lugar",
        type: "text",
        required: false,
      },
    ],
    defaultProps: {
      eyebrow: "Resultados de hoy",
      date: "Lunes 29 de junio",
      venue: "Pista de A Xunqueira, Redondela",
      matches: [
        {
          time: "10:00",
          home: "A Xunqueira",
          away: "Cesantes FC",
          homeScore: 2,
          awayScore: 1,
          category: "senior",
          categoryLabel: "Senior",
          group: "Grupo A",
        },
        {
          time: "11:00",
          home: "Chapela",
          away: "Vilar",
          homeScore: 0,
          awayScore: 0,
          homePenaltyScore: 4,
          awayPenaltyScore: 5,
          category: "cadet",
          categoryLabel: "Cadete",
          group: "Grupo B",
        },
        {
          time: "12:00",
          home: "Redondela",
          away: "Cedeira",
          homeScore: 3,
          awayScore: 2,
          category: "senior",
          categoryLabel: "Senior",
          group: "Grupo A",
        },
        {
          time: "13:00",
          home: "Saxamonde",
          away: "Reboreda",
          homeScore: 1,
          awayScore: 4,
          category: "cadet",
          categoryLabel: "Cadete",
          group: "Grupo C",
        },
      ],
    },
  }),
  defineTemplateDefinition({
    id: "group-standings-post",
    title: "Clasificación de grupo · Post (cuadrado)",
    kind: "image",
    preset: "square",
    durationInFrames: 1,
    schema: groupStandingsSchema,
    parameters: [
      {
        name: "eyebrow",
        label: "Etiqueta",
        type: "text",
        required: false,
      },
      {
        name: "groupName",
        label: "Grupo",
        type: "text",
        required: true,
      },
      {
        name: "phase",
        label: "Fase",
        type: "text",
        required: false,
      },
      {
        name: "categoryLabel",
        label: "Categoría",
        type: "text",
        required: false,
      },
      {
        name: "venue",
        label: "Lugar",
        type: "text",
        required: false,
      },
      {
        name: "qualifyCount",
        label: "Clasificados",
        type: "integer",
        required: false,
        min: 0,
        max: 8,
      },
    ],
    defaultProps: {
      eyebrow: "Clasificación",
      groupName: "Grupo A",
      phase: "Fase 1",
      category: "senior",
      categoryLabel: "Senior",
      venue: "Pista de A Xunqueira, Redondela",
      qualifyCount: 2,
      rows: [
        {
          teamId: "chapela",
          teamName: "Chapela FC",
          played: 3,
          wins: 3,
          draws: 0,
          losses: 0,
          goalsFor: 8,
          goalsAgainst: 2,
          goalDifference: 6,
          points: 9,
        },
        {
          teamId: "cesantes",
          teamName: "Cesantes Atlético",
          played: 3,
          wins: 1,
          draws: 1,
          losses: 1,
          goalsFor: 5,
          goalsAgainst: 4,
          goalDifference: 1,
          points: 4,
        },
        {
          teamId: "reboreda",
          teamName: "Reboreda",
          played: 3,
          wins: 1,
          draws: 1,
          losses: 1,
          goalsFor: 3,
          goalsAgainst: 4,
          goalDifference: -1,
          points: 4,
        },
        {
          teamId: "angorino",
          teamName: "Angoriño CF",
          played: 3,
          wins: 0,
          draws: 0,
          losses: 3,
          goalsFor: 1,
          goalsAgainst: 7,
          goalDifference: -6,
          points: 0,
        },
      ],
    },
  }),
  defineTemplateDefinition({
    id: "match-result-story",
    title: "Resultado de partido (story)",
    kind: "video",
    preset: "story",
    schema: matchResultStorySchema,
    parameters: [
      {
        name: "eyebrow",
        label: "Etiqueta",
        type: "text",
        required: false,
      },
      {
        name: "phase",
        label: "Fase",
        type: "text",
        required: false,
      },
      {
        name: "group",
        label: "Grupo",
        type: "text",
        required: false,
      },
      {
        name: "note",
        label: "Nota",
        type: "text",
        required: false,
      },
      {
        name: "venue",
        label: "Lugar",
        type: "text",
        required: false,
      },
    ],
    defaultProps: {
      eyebrow: "Resultado final",
      home: {
        name: "Chapela",
        score: 2,
      },
      away: {
        name: "Cesantes FC",
        score: 1,
      },
      category: "senior",
      categoryLabel: "Senior",
      phase: "Fase 1",
      group: "Grupo A",
      note: "Partidazo en A Xunqueira",
      venue: "Pista de A Xunqueira, Redondela",
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
  // single result / goal templates are built but parked for now.
  // Re-enable by adding template definitions here and matching Components in
  // registry.ts.
];
