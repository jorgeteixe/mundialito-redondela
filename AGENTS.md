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

## Conventions

- Use `@mr/*` for workspace imports.
- Export shared components from `packages/ui/src/index.ts`.
- Keep shared UI framework-neutral unless a component explicitly needs Next.js APIs.
- Use package-manager commands for manifest changes.
- Use conventional commits for all commit messages.
- Keep generated sample code out of the repo unless it is part of the product.

## Relevant Agent Skills

- Use frontend/browser verification after local UI changes.
- Use Storybook-oriented checks for shared component behavior and stories.
- Use diagnosis workflow for failing builds, lint, tests, or runtime bugs.
- Use TDD workflow when adding behavior-heavy shared components.
