import { Mastra } from "@mastra/core";
import { ConsoleLogger } from "@mastra/core/logger";
import { PostgresStore } from "@mastra/pg";
import { buildResultAgent } from "./agent";
import { getEnv } from "./env";

/**
 * Assemble the Mastra instance. Conversation state + memory live in the
 * existing tournament Postgres database (no separate datastore).
 */
export function createTelegramStorage(databaseUrl: string) {
  return new PostgresStore({
    id: "telegram-agent",
    connectionString: databaseUrl,
    // Emergency workaround for the VPS certificate signed by Coolify's
    // private CA. Remove after that CA is trusted by the production image.
    ssl: { rejectUnauthorized: false },
  });
}

export function buildMastra() {
  const env = getEnv();
  const storage = createTelegramStorage(env.databaseUrl);
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
