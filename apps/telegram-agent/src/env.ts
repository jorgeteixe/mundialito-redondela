function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}.`);
  }
  return value;
}

/**
 * Resolved configuration for the Telegram result agent. Read once at startup so
 * a misconfiguration fails fast and loudly instead of mid-conversation.
 */
export function getEnv() {
  return {
    /** BotFather token. The Chat SDK adapter also auto-reads this from env. */
    telegramBotToken: required("TELEGRAM_BOT_TOKEN"),
    /**
     * The single Telegram chat the bot is allowed to operate in. Every update
     * from any other chat is ignored. Dev and prod use different bot tokens +
     * group ids via their own env files — no code difference.
     */
    telegramGroupId: required("TELEGRAM_GROUP_ID"),
    googleApiKey: required("GOOGLE_GENERATIVE_AI_API_KEY"),
    databaseUrl: required("DATABASE_URL"),
    // Trigger.dev credentials are read by @mr/tournament's trigger helper; we
    // only assert they exist so publishing won't fail silently after approval.
    triggerApiUrl: required("TRIGGER_API_URL"),
    triggerSecretKey: required("TRIGGER_SECRET_KEY"),
  } as const;
}

export type Env = ReturnType<typeof getEnv>;
