# Backstage E2E Testing

`apps/backstage` uses Playwright for route, auth, and user-workflow E2E tests.

## Requirements

The suite reads `apps/backstage/.env.test`. Set `DATABASE_URL` there to a
dedicated test database. The setup resets the `public` schema before each run,
so never point it at a shared development or production database.

## Commands

```sh
# Run all backstage E2E tests headless
pnpm test:e2e

# Run only backstage E2E tests
pnpm --filter @mr/backstage test:e2e

# Open Playwright UI
pnpm --filter @mr/backstage test:e2e:ui
```

Playwright starts backstage on `http://localhost:3099` and seeds a deterministic test admin during global setup.

## Coverage Rules

Add or update E2E tests whenever a backstage feature changes route protection, login/logout behavior, navigation, or a user workflow crossing pages/API/auth/DB.

Feature work is not complete until its matching tests pass locally with the narrowest relevant command.
