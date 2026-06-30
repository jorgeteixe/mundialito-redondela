import { logger, schedules } from "@trigger.dev/sdk";
import {
  listResultPublishingMatches,
  type ResultPublishingMatch,
} from "@mr/db";
import {
  TELEGRAM_NUDGE_EVENING_TASK_ID,
  TELEGRAM_NUDGE_MIDDAY_TASK_ID,
  type TelegramNudgeOutput,
} from "../contracts";

const TIME_ZONE = "Europe/Madrid";

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dayKey(date: Date) {
  return dayKeyFormatter.format(date);
}

/** A result is "added" once both regular-time scores are present. */
function hasResult(match: ResultPublishingMatch) {
  return match.homeScore !== null && match.awayScore !== null;
}

/**
 * Post a plain text message to the Telegram group as the result bot. Reuses the
 * same `TELEGRAM_BOT_TOKEN` / `TELEGRAM_GROUP_ID` the agent worker uses, so the
 * nudge arrives from the same bot in the same group.
 */
async function sendGroupMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;
  if (!token) throw new Error("Missing required env var TELEGRAM_BOT_TOKEN.");
  if (!chatId) throw new Error("Missing required env var TELEGRAM_GROUP_ID.");

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Telegram sendMessage failed (${response.status}): ${body}`,
    );
  }
}

async function todayMatches(timestamp: Date) {
  const today = dayKey(timestamp);
  const matches = await listResultPublishingMatches();
  return {
    today,
    matches: matches.filter((match) => dayKey(match.scheduledAt) === today),
  };
}

const MIDDAY_MESSAGE = [
  "¿Cómo van los partidos de hoy? 👀⚽",
  "",
  "Aún no veo ningún resultado por aquí. ¿Me vais pasando cómo van? 🙏🏻",
].join("\n");

const EVENING_MESSAGE = [
  "¿Cómo quedaron los partidos de hoy? 📝⚽",
  "",
  "Faltan resultados por anotar. ¿Me pasáis los que falten para dejarlo todo al día? 🙏🏻",
].join("\n");

// 21:30 Madrid time. Nudges the group when matches are scheduled today but not a
// single result has been entered yet — "how are the games going?".
export const telegramNudgeMidday = schedules.task({
  id: TELEGRAM_NUDGE_MIDDAY_TASK_ID,
  cron: { pattern: "30 21 * * *", timezone: TIME_ZONE },
  run: async (payload): Promise<TelegramNudgeOutput> => {
    const { today, matches } = await todayMatches(payload.timestamp);
    const withResultCount = matches.filter(hasResult).length;

    if (matches.length === 0) {
      logger.info("Midday nudge skipped: no matches today", { today });
      return {
        date: today,
        matchCount: 0,
        withResultCount: 0,
        sent: false,
        skippedReason: "no-matches-today",
      };
    }

    if (withResultCount > 0) {
      logger.info("Midday nudge skipped: results already coming in", {
        today,
        withResultCount,
      });
      return {
        date: today,
        matchCount: matches.length,
        withResultCount,
        sent: false,
        skippedReason: "nothing-to-nudge",
      };
    }

    await sendGroupMessage(MIDDAY_MESSAGE);
    logger.info("Midday nudge sent", { today, matchCount: matches.length });

    return {
      date: today,
      matchCount: matches.length,
      withResultCount,
      sent: true,
      skippedReason: null,
    };
  },
});

// 23:15 Madrid time. Nudges the group when matches were scheduled today but at
// least one result is still missing — "how did they go?".
export const telegramNudgeEvening = schedules.task({
  id: TELEGRAM_NUDGE_EVENING_TASK_ID,
  cron: { pattern: "15 23 * * *", timezone: TIME_ZONE },
  run: async (payload): Promise<TelegramNudgeOutput> => {
    const { today, matches } = await todayMatches(payload.timestamp);
    const withResultCount = matches.filter(hasResult).length;

    if (matches.length === 0) {
      logger.info("Evening nudge skipped: no matches today", { today });
      return {
        date: today,
        matchCount: 0,
        withResultCount: 0,
        sent: false,
        skippedReason: "no-matches-today",
      };
    }

    if (withResultCount === matches.length) {
      logger.info("Evening nudge skipped: all results in", { today });
      return {
        date: today,
        matchCount: matches.length,
        withResultCount,
        sent: false,
        skippedReason: "nothing-to-nudge",
      };
    }

    await sendGroupMessage(EVENING_MESSAGE);
    logger.info("Evening nudge sent", {
      today,
      matchCount: matches.length,
      withResultCount,
    });

    return {
      date: today,
      matchCount: matches.length,
      withResultCount,
      sent: true,
      skippedReason: null,
    };
  },
});
