# Mundialito Redondela ⚽

Monorepo for the **Mundialito da Xunqueira 2026** in Redondela (Vigo area) — the platform to follow results, statistics, and schedules for the 47th edition of this street futsal tournament. See [EVENT.md](./EVENT.md) for tournament details.

Built as a **Turborepo + pnpm** monorepo, with Next.js apps, shared packages, self-hosted Trigger.dev jobs, and a Telegram result-entry agent.

---

## 🏗️ Architecture & Packages

### Apps

- **`apps/web`** (`@mr/web`) — public Next.js App Router website (results, standings, schedule).
- **`apps/backstage`** (`@mr/backstage`) — Next.js App Router admin app (port 3001) for managing the tournament.
- **`apps/jobs`** (`@mr/jobs`) — self-hosted Trigger.dev jobs that render media and publish to Instagram/Facebook.
- **`apps/video-worker`** (`@mr/video-worker`) — media rendering helpers shared by Trigger jobs.
- **`apps/social-worker`** (`@mr/social-worker`) — social publishing helpers shared by Trigger jobs.
- **`apps/telegram-agent`** (`@mr/telegram-agent`) — Mastra + Gemini chat agent that enters match results from a Telegram group via long polling.

### Packages

- **`packages/ui`** (`@mr/ui`) — shared React components (shadcn/ui) and Storybook.
- **`packages/db`** (`@mr/db`) — Drizzle ORM + PostgreSQL schema and client.
- **`packages/tournament`** (`@mr/tournament`) — shared tournament core: result application (`applyMatchResult`), bracket resolution, and standings.
- **`packages/remotion`** (`@mr/remotion`) — Remotion compositions for video/media rendering.
- **`packages/tools`** (`@mr/tools`) — CLI utilities (seeding, DB reset, etc.).
- **`packages/eslint-config`** (`@mr/eslint-config`) — shared ESLint flat configs.
- **`packages/typescript-config`** (`@mr/typescript-config`) — shared TypeScript compiler settings.

---

## 🚀 Getting Started

Install workspace dependencies:

```bash
pnpm install
```

Copy the example environment file and fill in the values:

```bash
cp .env.example .env
```

Run database migrations and seed data:

```bash
pnpm db:migrate
pnpm db:seed
pnpm db:seed-admin
```

Start development (web + backstage + local Trigger worker + Telegram agent):

```bash
pnpm dev
```

---

## 🛠️ Workspace Commands

| Command            | Action                                                  |
| :----------------- | :------------------------------------------------------ |
| `pnpm dev`         | Runs web, backstage, Trigger worker, and Telegram agent |
| `pnpm build`       | Production build of all workspace apps                  |
| `pnpm lint`        | Runs ESLint across the codebase                         |
| `pnpm typecheck`   | Validates TypeScript compilation                        |
| `pnpm test`        | Runs unit and Storybook browser tests                   |
| `pnpm test:e2e`    | Runs Playwright E2E tests                               |
| `pnpm test:visual` | Runs Storybook visual screenshot tests                  |
| `pnpm format`      | Formats all files using Prettier                        |
| `pnpm storybook`   | Starts Storybook for the UI library                     |

### Database

| Command              | Action                               |
| :------------------- | :----------------------------------- |
| `pnpm db:generate`   | Generate Drizzle migrations          |
| `pnpm db:migrate`    | Run migrations                       |
| `pnpm db:push`       | Push schema without a migration file |
| `pnpm db:studio`     | Open Drizzle Studio                  |
| `pnpm db:reset`      | Drop and re-migrate (no seed)        |
| `pnpm db:seed`       | Seed sample data                     |
| `pnpm db:seed-real`  | Seed real tournament data            |
| `pnpm db:seed-admin` | Seed an admin user                   |

### Trigger jobs & Telegram agent

| Command               | Action                                      |
| :-------------------- | :------------------------------------------ |
| `pnpm jobs:dev`       | Run the Trigger.dev dev worker              |
| `pnpm jobs:deploy`    | Deploy Trigger jobs                         |
| `pnpm telegram:dev`   | Run the Telegram result agent (dev, watch)  |
| `pnpm telegram:start` | Run the Telegram result agent (prod worker) |

### Package Filtering

Run commands against a single workspace package with pnpm's `--filter`:

```bash
pnpm --filter @mr/web dev          # public website only
pnpm --filter @mr/backstage dev    # admin app only (port 3001)
pnpm --filter @mr/ui storybook     # Storybook for the UI library
```

---

## 📖 Guides & Documentation

Detailed workflows and guidelines live in the [`docs/`](./docs) folder:

- **[Documentation Overview](docs/README.md)** — folder conventions and technical scope.
- **[Database](docs/database.md)** — Drizzle schema, migrations, and seeding.
- **[Auth](docs/auth.md)** — backstage authentication.
- **[UI Components](docs/ui-components.md)** — shadcn/ui setup, theming, and Storybook conventions.
- **[Testing Strategy](docs/testing-strategy.md)** — unit, component, visual, and E2E conventions.
- **[Backstage E2E Testing](docs/backstage-e2e-testing.md)** — Playwright setup for backstage auth and workflows.
- **[Telegram Result Agent](docs/telegram-result-agent.md)** — Mastra/Gemini agent for entering results from Telegram.
- **[Video Generation Queue](docs/video-generation-queue.md)** — media rendering pipeline.
- **[Social Publishing Queue](docs/social-publishing-queue.md)** — Instagram/Facebook publishing pipeline.
- **[Open Graph Generation](docs/open-graph-generation.md)** — OG image automation.
- **[Trigger.dev Pilot](docs/trigger-dev-pilot.md)** — self-hosted Trigger.dev setup.
- **[Visual Testing](docs/visual-testing.md)** — Storybook visual regression workflow.

---

## 📦 Imports Convention

Import shared code using the `@mr/*` workspace namespace:

```tsx
import { Button, Logo } from "@mr/ui";
```

---

## 📄 License

Licensed under the MIT License — see [LICENSE](./LICENSE).
