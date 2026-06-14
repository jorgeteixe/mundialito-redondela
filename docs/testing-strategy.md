# Testing Strategy

This monorepo uses one testing vocabulary across apps and packages. Package scripts own the actual work; root scripts only delegate through Turborepo.

## Commands

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm test:visual
```

Use package filters for focused work:

```sh
pnpm --filter @mr/web test
pnpm --filter @mr/web test:e2e
pnpm --filter @mr/backstage test:e2e
pnpm --filter @mr/ui test:visual
```

## Test Types

- Unit tests: pure logic, schemas, helpers, and CLI internals. Use Vitest and colocate as `*.test.ts`.
- Component tests: shared UI behavior in `packages/ui/src/components`. Use Vitest, Testing Library, and jsdom.
- Storybook visual tests: shared UI visual states. Use `pnpm test:visual` and commit updated screenshots when UI output intentionally changes.
- E2E tests: app workflows crossing route, auth, API, or DB boundaries. Use Playwright under each app's `e2e/` directory.

## Package Conventions

- Apps keep unit tests under app-local folders such as `app/**/*.test.{ts,tsx}` or `lib/**/*.test.{ts,tsx}`.
- Packages keep unit tests under `src/**/*.test.ts`.
- Playwright specs live under `apps/<app>/e2e/**/*.spec.ts`.
- New features must include the narrowest useful test, then any higher-level test needed for workflow confidence.

## Verification Rules

- Shared package logic: run `pnpm --filter <package> test`, plus `lint` and `typecheck`.
- Shared UI changes: run `pnpm --filter @mr/ui test`; run `pnpm --filter @mr/ui test:visual` when visual output changes.
- Public web workflow changes: run `pnpm --filter @mr/web test:e2e`.
- Backstage auth/API/DB workflow changes: run `pnpm --filter @mr/backstage test:e2e` with Postgres running.
- Before handoff after cross-package changes, run root `pnpm lint`, `pnpm typecheck`, and `pnpm test`.

## Transition Rule

Some packages use `--passWithNoTests` while coverage is being introduced. Remove it from a package once that package has stable tests.
