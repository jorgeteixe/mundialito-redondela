import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { listPublicMatches } from "@mr/db";
import { applyMatchResult } from "@mr/tournament";
import {
  isPlayed,
  madridDayKey,
  madridTime,
  resolveMatch,
} from "./match-resolver";

const scoreField = z.number().int().min(0).max(99);

function todayMadridKey(): string {
  return madridDayKey(new Date().toISOString());
}

/**
 * Read-only. Lists the fixtures of a given day (default: today, Europe/Madrid)
 * so people know which game to report. Returns full team names, kickoff time,
 * current score and whether each match has been played.
 */
export const getSchedule = createTool({
  id: "getSchedule",
  description:
    "Devuelve los partidos de un día (por defecto hoy) con nombres completos, hora, marcador actual y si ya se jugaron. Úsalo cuando pregunten por el horario o para saber qué partidos hay.",
  inputSchema: z.object({
    day: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Día en formato YYYY-MM-DD. Si se omite, usa hoy."),
  }),
  outputSchema: z.object({
    day: z.string(),
    count: z.number(),
    matches: z.array(
      z.object({
        time: z.string(),
        home: z.string(),
        away: z.string(),
        kind: z.string(),
        category: z.string(),
        status: z.enum(["jugado", "pendiente"]),
        score: z.string().nullable(),
      }),
    ),
  }),
  execute: async (input: { day?: string }) => {
    const day = input.day ?? todayMadridKey();
    const all = await listPublicMatches();
    const matches = all
      .filter((m) => madridDayKey(m.scheduledAt) === day)
      .map((m) => {
        const played = isPlayed(m);
        const penalties =
          m.homePenalties !== null && m.awayPenalties !== null
            ? ` (pen. ${m.homePenalties}-${m.awayPenalties})`
            : "";
        return {
          time: madridTime(m.scheduledAt),
          home: m.homeTeamName,
          away: m.awayTeamName,
          kind: m.kind,
          category: m.category,
          status: played ? ("jugado" as const) : ("pendiente" as const),
          score: played ? `${m.homeScore}-${m.awayScore}${penalties}` : null,
        };
      });
    return { day, count: matches.length, matches };
  },
});

/**
 * Read-only. Resolves a free-text result to a concrete fixture, orients the
 * scores to the fixture's home/away sides and validates the penalty rules.
 * NEVER writes — the agent uses this to build the confirmation, then calls
 * submitMatchResult.
 */
export const resolveMatchForResult = createTool({
  id: "resolveMatchForResult",
  description:
    "Identifica el partido al que corresponde un resultado en lenguaje natural y devuelve los nombres completos y el marcador orientado a local/visitante. No guarda nada. Llama a esto antes de confirmar un resultado.",
  inputSchema: z.object({
    teamA: z.string().describe("Primer equipo mencionado."),
    scoreA: scoreField.describe("Goles del primer equipo."),
    teamB: z.string().describe("Segundo equipo mencionado."),
    scoreB: scoreField.describe("Goles del segundo equipo."),
    penaltiesA: scoreField
      .optional()
      .describe("Penaltis del primer equipo (solo eliminatorias con empate)."),
    penaltiesB: scoreField
      .optional()
      .describe("Penaltis del segundo equipo (solo eliminatorias con empate)."),
    dayHint: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Día del partido (YYYY-MM-DD) para desambiguar."),
  }),
  execute: async (input: {
    teamA: string;
    scoreA: number;
    teamB: string;
    scoreB: number;
    penaltiesA?: number;
    penaltiesB?: number;
    dayHint?: string;
  }) => {
    const matches = await listPublicMatches();
    return resolveMatch(matches, input);
  },
});

/**
 * The only write tool. Gated by requireApproval so Mastra renders a native
 * Approve/Deny card in Telegram; the result is persisted (and the bracket
 * re-resolved + publishing fired) ONLY after a human taps approve.
 */
export const submitMatchResult = createTool({
  id: "submitMatchResult",
  description:
    "Guarda el resultado de un partido. Requiere aprobación humana en el chat. Úsalo solo con los valores exactos devueltos por resolveMatchForResult.",
  requireApproval: true,
  inputSchema: z.object({
    matchId: z
      .string()
      .describe("ID del partido devuelto por resolveMatchForResult."),
    homeName: z.string().describe("Nombre completo del equipo local."),
    awayName: z.string().describe("Nombre completo del equipo visitante."),
    homeScore: scoreField,
    awayScore: scoreField,
    homePenalties: scoreField.optional(),
    awayPenalties: scoreField.optional(),
  }),
  execute: async (input: {
    matchId: string;
    homeName: string;
    awayName: string;
    homeScore: number;
    awayScore: number;
    homePenalties?: number;
    awayPenalties?: number;
  }) => {
    const outcome = await applyMatchResult({
      matchId: input.matchId,
      homeScore: input.homeScore,
      awayScore: input.awayScore,
      homePenalties: input.homePenalties ?? null,
      awayPenalties: input.awayPenalties ?? null,
    });

    if (!outcome.ok) {
      return { ok: false as const, message: outcome.message };
    }

    const penalties =
      outcome.homePenalties !== null && outcome.awayPenalties !== null
        ? ` (penaltis ${outcome.homePenalties}-${outcome.awayPenalties})`
        : "";
    return {
      ok: true as const,
      message: `✅ Resultado guardado: ${outcome.homeName} ${outcome.homeScore}-${outcome.awayScore} ${outcome.awayName}${penalties}.`,
    };
  },
});

export const tools = {
  getSchedule,
  resolveMatchForResult,
  submitMatchResult,
};
