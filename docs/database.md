# Database

Shared Drizzle + PostgreSQL package (`@mr/db`) consumed by all apps.

## Architecture

- `packages/db/src/client.ts` — Drizzle client (uses `postgres` driver + `DATABASE_URL` env).
- `packages/db/src/schema/` — one file per domain; `index.ts` re-exports all tables.
- `packages/db/drizzle/` — generated SQL migrations (committed to repo).
- `packages/db/drizzle.config.ts` — Drizzle Kit config.

## Local development

```sh
# Copy and fill root env
cp .env.example .env
```

Set `DATABASE_URL` to a reachable PostgreSQL database. Local development uses
the same remote database style as Trigger.dev development, so the Trigger dev
worker and Backstage can see the same data.

```
DATABASE_URL=
```

## Migrations

```sh
# After editing a schema file, generate a new migration
pnpm --filter @mr/db db:generate

# Apply pending migrations
pnpm --filter @mr/db db:migrate
```

Migrations run against `DATABASE_URL` from the shell or root `.env`.

## Adding new tables

1. Create `packages/db/src/schema/<domain>.ts` with Drizzle table definitions.
2. Export from `packages/db/src/schema/index.ts`.
3. Run `pnpm --filter @mr/db db:generate` to generate the migration.
4. Run `pnpm --filter @mr/db db:migrate` to apply.

## Test database

E2E tests in `apps/backstage` should use a separate remote/test database.
Playwright global setup resets the schema, applies committed migrations, and
seeds a test admin before the suite. See [Backstage E2E Testing](./backstage-e2e-testing.md).
