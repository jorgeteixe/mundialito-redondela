# Mundialito Redondela Agent Guide

## Stack

- Package manager: pnpm 10.
- Monorepo: Turborepo.
- App: `apps/web`, Next.js App Router, package name `@mr/web`.
- Shared UI: `packages/ui`, React components exported as `@mr/ui`.
- Shared config: `@mr/eslint-config` and `@mr/typescript-config`.

## Commands

- Install: `pnpm install`
- Develop all packages: `pnpm dev`
- Develop web only: `pnpm --filter @mr/web dev`
- Storybook: `pnpm --filter @mr/ui storybook`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- Format: `pnpm format`
- Storybook screenshots: `pnpm screenshot:storybook` (saves screenshots in `packages/ui/artifacts/storybook/`)

## Conventions

- Keep this agent guide (`AGENTS.md`) updated as the codebase, dependencies, commands, or tooling evolve.
- Keep documentation under the `docs/` directory clean and updated, following the guidelines inside `docs/agents.md`.
- Use `@mr/*` for workspace imports.
- Export shared components from `packages/ui/src/index.ts`.
- Keep shared UI framework-neutral unless a component explicitly needs Next.js APIs.
- Use package-manager commands for manifest changes.
- Use conventional commits for all commit messages.
- Keep public-facing content always in Spanish, while code and other internals remain in English.
- Keep generated sample code out of the repo unless it is part of the product.
- Keep Storybook screenshots updated by running `pnpm screenshot:storybook` when shared UI components or stories are modified.

## Relevant Agent Skills

- Use frontend/browser verification after local UI changes.
- Use Storybook-oriented checks for shared component behavior and stories.
- Use diagnosis workflow for failing builds, lint, tests, or runtime bugs.
- Use TDD workflow when adding behavior-heavy shared components.
