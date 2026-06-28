# Telegram result agent (`@mr/telegram-agent`)

An AI agent that lets tournament admins enter match results from a Telegram
group by chatting in Spanish. It is a long-running worker (`apps/telegram-agent`)
built on [Mastra](https://mastra.ai) + the [Chat SDK](https://chat-sdk.dev)
Telegram adapter, using **Google Gemini 2.5 Flash**.

## What it does

- **Schedule**: "¿qué partidos hay hoy?" / "horario del 11 de julio" → lists the
  day's fixtures with full team names, kickoff time and current score.
- **Results**: someone writes a result in natural language ("Barça 2 Madrid 1").
  The agent resolves it to the exact fixture, orients the score to home/away and
  replies with a confirmation using the **full team names**.
- **Approval gate**: saving is a tool with `requireApproval: true`, so Mastra
  renders a native **Aprobar / Denegar** card in the chat. The result is written
  **only** after a human taps Aprobar.
- **On approval** it runs the exact same path as the backstage form — it calls
  `applyMatchResult()` from `@mr/tournament`, which updates the match,
  re-resolves the bracket/standings and fires the Trigger.dev publishing
  pipeline (Instagram story + day-results carousel).

The LLM is **read-only** (`getSchedule`, `resolveMatchForResult`). The only write
path is the approved `submitMatchResult` tool, so the model can never persist a
result on its own.

## Penalty rules

Enforced in one place (`@mr/tournament`'s `validateResultInput`) and surfaced by
the agent:

- **Group matches**: never penalties, goals only.
- **Knockouts** (semifinal / tercer puesto / final): regular-time goals and
  penalties are separate. If regular time ends level, the agent asks for the
  shootout result **separately** and the confirmation shows them apart
  (e.g. `Reglamentario 2-2 · Penaltis 4-3`). Penalties on a decided knockout are
  rejected.

## Transport: long polling

The bot uses **long polling** (`createTelegramAdapter({ mode: "polling" })`) — it
calls Telegram's `getUpdates`, so **no public URL / webhook / tunnel is needed**.
Just run the worker anywhere with outbound internet + database access.

## Environment

Set in the app's `.env.local` (dev) or production env:

| Variable                                 | Purpose                                                      |
| ---------------------------------------- | ------------------------------------------------------------ |
| `TELEGRAM_BOT_TOKEN`                     | BotFather token. Use a **different bot** for dev vs prod.    |
| `TELEGRAM_GROUP_ID`                      | The single group the bot may act in (e.g. `-1001234567890`). |
| `GOOGLE_GENERATIVE_AI_API_KEY`           | Google AI Studio key for Gemini 2.5 Flash.                   |
| `DATABASE_URL`                           | Existing tournament Postgres (also stores agent memory).     |
| `TRIGGER_API_URL` / `TRIGGER_SECRET_KEY` | To fire publishing after a result is saved.                  |

Dev vs prod is **purely env-driven**: a dev bot + dev test group in one env file,
a prod bot + the real group in another. No code differences.

## One-time Telegram setup

1. Create the bot in **@BotFather** (one for dev, one for prod).
2. **Disable Group Privacy**: BotFather → `/setprivacy` → select the bot →
   **Disable**. Otherwise the bot only sees messages that @mention it, and plain
   results like "Barça 2 Madrid 1" won't reach it.
3. Add the bot to the group. To discover the group id, temporarily log incoming
   updates (or use a helper bot) and copy the negative chat id into
   `TELEGRAM_GROUP_ID`.

The bot ignores every chat except `TELEGRAM_GROUP_ID`, so anyone you add to that
group can report results; everyone else is silently dropped.

## Run

```sh
# local dev (watch mode)
pnpm telegram:dev

# production (long-running worker — supervise with systemd / pm2 / Docker)
pnpm telegram:start
```

Conversation memory + Chat SDK state live in the existing Postgres database
(`PostgresStore`), so there is no extra datastore to provision.

## Code map

- `src/index.ts` — entrypoint: loads env, builds Mastra, starts channel polling.
- `src/mastra.ts` — Mastra instance with `PostgresStore`.
- `src/agent.ts` — the agent: Spanish instructions, Gemini model, tools, memory,
  Telegram channel + the group-id guard.
- `src/tools.ts` — `getSchedule`, `resolveMatchForResult` (read-only),
  `submitMatchResult` (`requireApproval`).
- `src/match-resolver.ts` — pure fixture-resolution + penalty validation + the
  channel guard (unit-tested in `match-resolver.test.ts`).

The shared result-application core (update + `resolveBracket` + publish trigger)
lives in `@mr/tournament` (`applyMatchResult`) and is the same code the backstage
result form uses.
