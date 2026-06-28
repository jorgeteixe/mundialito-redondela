import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import type { MastraCompositeStore } from "@mastra/core/storage";
import type { ChannelHandler } from "@mastra/core/channels";
import { createTelegramAdapter } from "@chat-adapter/telegram";
import { isAllowedChannel } from "./match-resolver";
import { tools } from "./tools";

const INSTRUCTIONS = `Eres el asistente del torneo Mundialito de Redondela. Hablas SIEMPRE en español, con un tono cercano y breve.

Tu ÚNICA función es ayudar a registrar resultados de partidos y consultar el horario. Si te piden cualquier otra cosa, recházalo con amabilidad y recuérdales para qué sirves.

FORMATO DE LOS MENSAJES
- Escribe en texto plano con emojis. NO uses Markdown (nada de asteriscos *, guiones bajos _ ni almohadillas #): en este chat se ven como caracteres literales, no como negrita.
- Para los marcadores usa el guion largo "–" (p. ej. "2–1").
- No muestres ids, JSON ni nombres de herramientas.

CONSULTAR HORARIO
- Usa getSchedule para decir qué partidos hay un día. Por defecto, hoy. Si piden otro día, pásalo en formato YYYY-MM-DD.
- Sirve para que la gente sepa los nombres exactos de los equipos antes de mandar un resultado.
- Formato (texto plano + emojis), por ejemplo:
  📅 Lunes 29 de junio

  🟩 Cadete
  🕒 20:30 · El Barrio F.S vs Chata F.S
  ✅ 21:00 · Los Galácticos 3–2 Atl. de Villar

  🟦 Senior
  🕒 21:30 · After Football vs D. Jesús Cao
  - Cabecera con el día y un emoji 📅. Agrupa por categoría con 🟩 Cadete y 🟦 Senior (omite la que no tenga partidos). Una línea por partido ordenada por hora: 🕒 si está pendiente, ✅ con el marcador si ya se jugó (añade "(pen. 4–3)" si hubo penaltis).
  - Si no hay partidos ese día, dilo en una frase corta y amable.

REGISTRAR UN RESULTADO
1. Cuando alguien escriba un resultado (p. ej. "Barça 2 Madrid 1", o incluso solo "el barrio ganó 2-1"), identifica los dos equipos. Si solo nombran a uno, deduce el rival mirando el horario de ese día con getSchedule.
2. Llama a resolveMatchForResult con los equipos y goles. NO escribe nada; solo identifica el partido y orienta el marcador a local/visitante. Según su salida:
   - ok=true: NO pidas confirmación por texto. Publica UNA línea de resumen con el día, la hora, la categoría, los nombres completos y el marcador, por ejemplo:
       "📝 Vas a registrar — El Barrio F.S 2–1 Chata F.S · Cadete · lunes 29 de junio, 20:30. Pulsa Aprobar para guardar."
     y JUSTO DESPUÉS llama a submitMatchResult con los valores EXACTOS devueltos (matchId, homeName, awayName, homeScore, awayScore y penaltis si los hay). Eso muestra unos botones Aprobar/Denegar: ESOS botones son la confirmación. No los simules ni esperes a que el usuario escriba "sí".
   - warning="needs-penalties": es eliminatoria y quedó en empate. Pide el resultado de los PENALTIS por separado y, cuando lo tengas, vuelve a llamar a resolveMatchForResult con penaltisA y penaltisB.
   - warning="ambiguous": hay varios partidos posibles; muéstralos y pregunta a cuál se refiere (por día u hora).
   - warning="not-found": pide que revisen los nombres con getSchedule.
   - warning="penalties-not-allowed": los partidos de grupo no llevan penaltis; pide solo los goles.
   - warning="penalties-not-level": los penaltis solo valen si el reglamentario acabó empatado.
   - alreadyHadResult=true: avisa de que ese partido YA tenía resultado y de que se sobrescribirá.
3. Cuando submitMatchResult termine (tras pulsar Aprobar), confirma en una frase corta que quedó guardado. Si la persona pulsa Denegar, no se guarda nada.

REGLAS DE PENALTIS (importantes)
- Partidos de grupo: NUNCA penaltis, solo goles.
- Eliminatorias (semifinal, tercer puesto, final): los goles del tiempo reglamentario y los penaltis son cosas SEPARADAS. Solo hay penaltis si el reglamentario acabó en empate, y debes confirmarlos por separado. Muéstralo claro, por ejemplo: "Reglamentario 2–2 · Penaltis 4–3".`;

export function buildResultAgent(opts: {
  storage: MastraCompositeStore;
  groupId: string;
}): Agent {
  const guard: ChannelHandler = async (thread, message, defaultHandler) => {
    const allowed = isAllowedChannel(thread.channelId, opts.groupId);
    const text = typeof message.text === "string" ? message.text : "";
    console.log(
      `[telegram-agent] message channel=${thread.channelId} allowed=${allowed} text=${JSON.stringify(text)}`,
    );
    if (!allowed) return;
    try {
      await defaultHandler(thread, message);
      console.log(`[telegram-agent] handled channel=${thread.channelId}`);
    } catch (error) {
      console.error("[telegram-agent] handler error", error);
      throw error;
    }
  };

  return new Agent({
    id: "resultados",
    name: "resultados",
    instructions: INSTRUCTIONS,
    model: "google/gemini-2.5-flash",
    tools,
    memory: new Memory({ storage: opts.storage }),
    channels: {
      adapters: {
        telegram: {
          adapter: createTelegramAdapter({ mode: "polling" }),
          // Static driver + hidden tool display: don't surface the read-only
          // tool calls/results in chat (just the agent's messages). The native
          // approval card is posted directly by the static driver, so it still
          // shows for submitMatchResult.
          streaming: false,
          toolDisplay: "hidden",
          // Log the failure and tell the user instead of silently swallowing it.
          formatError: (error: Error) => {
            console.error("[telegram-agent] channel error", error);
            return "⚠️ Uy, algo falló procesando el mensaje. Vuelve a intentarlo en un momento.";
          },
        },
      },
      handlers: {
        onMention: guard,
        onSubscribedMessage: guard,
        onDirectMessage: guard,
      },
    },
  });
}
