import { Mastra } from "@mastra/core";
import { ConsoleLogger } from "@mastra/core/logger";
import { PostgresStore } from "@mastra/pg";
import { buildResultAgent } from "./agent";
import { getEnv } from "./env";

/**
 * Assemble the Mastra instance. Conversation state + memory live in the
 * existing tournament Postgres database (no separate datastore).
 */
export function buildMastra() {
  const env = getEnv();
  const storage = new PostgresStore({
    id: "telegram-agent",
    connectionString: env.databaseUrl,
  });
  const agent = buildResultAgent({ storage, groupId: env.telegramGroupId });
  const mastra = new Mastra({
    agents: { resultados: agent },
    storage,
    // Verbose logging so model/tool/channel errors are visible end to end.
    logger: new ConsoleLogger({
      level: (process.env.TELEGRAM_LOG_LEVEL as "debug" | "info") ?? "debug",
    }),
  });
  return { mastra, env };
}
