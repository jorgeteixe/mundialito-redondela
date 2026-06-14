# Database

Shared Drizzle + PostgreSQL package (`@mr/db`) consumed by all apps.

## Architecture

- `packages/db/src/client.ts` — Drizzle client (uses `postgres` driver + `DATABASE_URL` env).
- `packages/db/src/schema/` — one file per domain; `index.ts` re-exports all tables.
- `packages/db/drizzle/` — generated SQL migrations (committed to repo).
- `packages/db/drizzle.config.ts` — Drizzle Kit config.

## Local development

```sh
# Start PostgreSQL
docker compose up -d

# Copy and fill env
cp apps/backstage/.env.example apps/backstage/.env.local
```

Default connection string (matches docker-compose defaults):

```
DATABASE_URL=postgresql://mundialito:mundialito@localhost:5432/mundialito
```

## Migrations

```sh
# After editing a schema file, generate a new migration
pnpm --filter @mr/db db:generate

# Apply pending migrations
pnpm --filter @mr/db db:migrate
```

Migrations run against `DATABASE_URL`. For production, set the env var to the prod connection string before running.

## Adding new tables

1. Create `packages/db/src/schema/<domain>.ts` with Drizzle table definitions.
2. Export from `packages/db/src/schema/index.ts`.
3. Run `pnpm --filter @mr/db db:generate` to generate the migration.
4. Run `pnpm --filter @mr/db db:migrate` to apply.

## Test database

E2E tests in `apps/backstage` use a separate `mundialito_test` database. The `global-setup.ts` runs migrations and seeds a test admin before the suite. See `docs/auth.md` for details.
