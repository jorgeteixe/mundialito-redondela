# Backstage E2E Testing

`apps/backstage` uses Playwright for route, auth, and user-workflow E2E tests.

## Requirements

Start local PostgreSQL before running E2E tests:

```sh
docker compose up -d
```

The suite reads `apps/backstage/.env.test`. It uses the `mundialito_test` database and resets the `public` schema before each run.

## Commands

```sh
# Run all backstage E2E tests headless
pnpm test:e2e

# Run only backstage E2E tests
pnpm --filter @mr/backstage test:e2e

# Open Playwright UI
pnpm --filter @mr/backstage test:e2e:ui
```

Playwright starts backstage on `http://127.0.0.1:3099` and seeds a deterministic test admin during global setup.

## Coverage Rules

Add or update E2E tests whenever a backstage feature changes route protection, login/logout behavior, navigation, or a user workflow crossing pages/API/auth/DB.

Feature work is not complete until its matching tests pass locally with the narrowest relevant command.
