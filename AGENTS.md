# Mundialito Redondela Agent Guide

## Stack

- Package manager: pnpm 10.
- Monorepo: Turborepo.
- App: `apps/web`, Next.js App Router, package name `@mr/web`.
- Admin app: `apps/backstage`, Next.js App Router, package name `@mr/backstage` (port 3001).
- Shared UI: `packages/ui`, React components exported as `@mr/ui`.
- Shared DB: `packages/db`, Drizzle + PostgreSQL exported as `@mr/db`.
- Shared tooling: `packages/tools`, CLI utilities exported as `@mr/tools`.
- Shared config: `@mr/eslint-config` and `@mr/typescript-config`.

## Commands

- Install: `pnpm install`
- Develop all packages: `pnpm dev`
- Develop web only: `pnpm --filter @mr/web dev`
- Develop backstage only: `pnpm --filter @mr/backstage dev`
- Storybook: `pnpm --filter @mr/ui storybook`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- E2E tests: `pnpm test:e2e`
- Format: `pnpm format`
- Storybook screenshots: `pnpm screenshot:storybook` (saves screenshots in `packages/ui/artifacts/storybook/`)
- Start local DB: `docker compose up -d`
- DB generate migrations: `pnpm --filter @mr/db db:generate`
- DB run migrations: `pnpm --filter @mr/db db:migrate`
- Seed admin user: `pnpm --filter @mr/tools seed-admin`

## UI Component Structure

`packages/ui/src/` is organized as follows:

- `src/ui/` — **shadcn primitives, CLI-generated. Never edit these files manually.** Add or update components via `pnpm --filter @mr/ui exec shadcn add <component>`.
- `src/components/` — custom components built on top of shadcn primitives. Co-locate tests here.
- `src/stories/ui/` — Storybook stories for shadcn primitives in `src/ui/`.
- `src/stories/components/` — Storybook stories for custom components in `src/components/`.
- `src/lib/` — shared utilities (`cn`, etc.).

See `docs/ui-components.md` for the full rationale.

## Responsive Design Rules

**Mobile-first, always.** The primary audience consumes this app on mobile. Every layout, component, and interaction must work well on a small screen first, then be enhanced for larger screens.

- Write base styles for mobile, layer breakpoints upward (`sm:`, `md:`, `lg:`). Never write desktop-first styles and try to override down.
- Test every UI change at a narrow viewport (375px / iPhone-sized) before checking desktop.
- Flex and grid layouts: give elements natural or `flex-none` sizing on mobile so content isn't artificially squeezed into half-columns. Use `sm:flex-1` or `md:grid-cols-X` to introduce multi-column layouts at larger sizes.
- Touch targets: interactive elements must be at least 44×44px on mobile. Prefer `size="sm"` or larger on buttons.
- Text: never use `whitespace-nowrap` to force single-line text on mobile — instead ensure the container has enough room. If text must truncate, do so intentionally with `truncate` and `min-w-0` on the flex parent.
- Navigation: on mobile, collapse navItems behind a hamburger. Always-visible actions (theme toggle, auth) stay in the header bar, never in the collapsible menu.

**Desktop is an enhancement, not an afterthought.** At `sm:` and above:

- Introduce centered nav (`hidden sm:flex`), multi-column grids, larger typography, and richer layouts.
- Ensure keyboard navigation, hover states, and focus rings work correctly.

## shadcn-First Design Rules

**Always check the shadcn registry before writing any UI component.** If it exists in shadcn, install it — do not hand-roll it.

```sh
pnpm --filter @mr/ui exec shadcn add <component-name>
```

Current config: **style `radix-lyra`, base color `mist`** (`packages/ui/components.json`). All installed primitives go to `src/ui/`.

**Decision rule — when to build a custom component:**

1. shadcn has no equivalent → build in `src/components/`, composing shadcn primitives.
2. shadcn has it → install via CLI. Never duplicate.
3. Need a variant/composition → extend the primitive via props or `cn()`, not a new file.

**Design token rules — always use shadcn CSS variables:**

- Backgrounds: `bg-background`, `bg-card`, `bg-muted`, `bg-popover`, `bg-primary`, `bg-secondary`, `bg-accent`, `bg-destructive`
- Text: `text-foreground`, `text-card-foreground`, `text-muted-foreground`, `text-primary`, `text-primary-foreground`, `text-secondary-foreground`, `text-accent-foreground`, `text-destructive`
- Borders/rings: `border-border`, `ring-ring`
- **Never use raw Tailwind palette colors** (`text-gray-500`, `bg-zinc-900`, etc.) for themed UI — only for non-themed utilities like sizing or spacing.

**Framework-neutral rule:** Components in `src/components/` must not import Next.js-specific APIs (`next/navigation`, `next-themes`, etc.). Components that require Next.js APIs belong in `apps/web/app/components/`, not in the shared package.

## Conventions

- Keep this agent guide (`AGENTS.md`) updated as the codebase, dependencies, commands, or tooling evolve. Note: `CLAUDE.md` is a symlink to `AGENTS.md` — edit `AGENTS.md`.
- Keep documentation under the `docs/` directory clean and updated, following the guidelines inside `docs/AGENTS.md`.
- Use `@mr/*` for workspace imports.
- Export shared components from `packages/ui/src/index.ts`.
- Use package-manager commands for manifest changes.
- Use conventional commits for all commit messages.
- Keep public-facing content always in Spanish, while code and other internals remain in English.
- Keep generated sample code out of the repo unless it is part of the product.
- Keep Storybook screenshots updated by running `pnpm screenshot:storybook` when shared UI components or stories are modified.
- Every new feature must include appropriate tests and be verified with the matching test command before handoff.
- For backstage UI/auth workflows, add or update Playwright E2E coverage when behavior crosses route, auth, API, or DB boundaries.

## Communication Style

Use **caveman mode** by default for all responses. Drop articles, filler (just/really/basically), pleasantries (sure/happy to/certainly), and hedging. Fragments OK. Short synonyms. Technical terms exact. Code blocks unchanged. Pattern: `[thing] [action] [reason].`

Revert to full prose only for: security warnings, irreversible-action confirmations, multi-step sequences where fragment order risks misread.

## Relevant Agent Skills

Project-specific skills live in `.agents/skills/`. Install or update them with `npx skills`.

- Use frontend/browser verification after local UI changes.
- Use Storybook-oriented checks for shared component behavior and stories.
- Use diagnosis workflow for failing builds, lint, tests, or runtime bugs.
- Use TDD workflow when adding behavior-heavy shared components.
