# Mundialito Redondela

Turborepo monorepo for Mundialito Redondela.

## Apps and Packages

- `apps/web`: Next.js app, package `@mr/web`.
- `packages/ui`: shared React UI components, package `@mr/ui`.
- `packages/eslint-config`: shared ESLint flat configs, package `@mr/eslint-config`.
- `packages/typescript-config`: shared TypeScript configs, package `@mr/typescript-config`.

## Commands

```sh
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm format
```

Run a target for one package with filters:

```sh
pnpm --filter @mr/web dev
pnpm --filter @mr/ui storybook
pnpm --filter @mr/ui build-storybook
```

## Imports

Use the `@mr/*` namespace for workspace packages:

```tsx
import { Welcome } from "@mr/ui";
```
