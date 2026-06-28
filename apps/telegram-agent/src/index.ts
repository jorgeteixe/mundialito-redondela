// Load env before anything that reads process.env at import time (@mr/db).
import "./load-env";
import { buildMastra } from "./mastra";

async function main() {
  const { mastra, env } = buildMastra();

  // Start the Telegram channel(s). In polling mode this opens a getUpdates loop
  // — no public URL / webhook required.
  const channels = mastra.getChannels();
  await Promise.all(
    Object.values(channels).map((channel) => channel.initialize(mastra)),
  );

  // Subscribe the bot to the group thread so it answers EVERY message there,
  // not only @mentions. Telegram encodes a non-topic group thread as
  // `telegram:<chatId>`. Subscriptions persist in Postgres across restarts.
  const groupThreadId = `telegram:${env.telegramGroupId}`;
  for (const channel of Object.values(channels)) {
    try {
      await channel.sdk?.thread(groupThreadId).subscribe();
    } catch (error) {
      console.warn(
        `[telegram-agent] could not subscribe to ${groupThreadId}`,
        error,
      );
    }
  }

  console.log(
    `[telegram-agent] listening (polling) for Telegram group ${env.telegramGroupId}`,
  );

  // Keep the process alive; polling runs on background timers.
  setInterval(() => {}, 1 << 30);
}

main().catch((error) => {
  console.error("[telegram-agent] fatal startup error", error);
  process.exit(1);
});
