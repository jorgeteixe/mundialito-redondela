# Mundialito Redondela ⚽

Welcome to the monorepo for the **Mundialito da Xunqueira 2026** in Redondela (Vigo area). This repository houses the platform to follow results, statistics, and schedules for the 47th edition of this street football tournament.

Built as a Turbopack-powered Next.js application, the project uses a workspace-focused Monorepo architecture.

---

## 🏗️ Architecture & Packages

The project is structured as a monorepo utilizing **Turborepo** and **pnpm**:

- **`apps/web`**: Next.js App Router website, packaged as `@mr/web`.
- **`packages/ui`**: Shared React components and Storybook, packaged as `@mr/ui`.
- **`packages/eslint-config`**: Shared ESLint flat configurations, packaged as `@mr/eslint-config`.
- **`packages/typescript-config`**: Shared TypeScript compiler settings, packaged as `@mr/typescript-config`.

---

## 🚀 Getting Started

First, install the workspace dependencies:

```bash
pnpm install
```

To launch the development server for the entire monorepo (both the website and Storybook):

```bash
pnpm dev
```

---

## 🛠️ Workspace Commands

The following scripts are configured in the root `package.json` to manage all packages:

| Command          | Action                                                           |
| :--------------- | :--------------------------------------------------------------- |
| `pnpm dev`       | Starts Next.js and Storybook concurrently in development mode    |
| `pnpm build`     | Performs a production build of all applications in the workspace |
| `pnpm lint`      | Runs ESLint across the codebase                                  |
| `pnpm typecheck` | Validates TypeScript compilation                                 |
| `pnpm test`      | Runs unit and Storybook browser tests                            |
| `pnpm format`    | Formats all files using Prettier                                 |

### Package Filtering

To run commands on a specific workspace package, use pnpm's `--filter` flag:

```bash
# Run Next.js website in development mode
pnpm --filter @mr/web dev

# Start Storybook for the UI library
pnpm --filter @mr/ui storybook
```

---

## 📖 Guides & Documentation

Detailed workflows, guidelines, and visual assets automation instructions are stored in the `/docs` folder:

- **[Documentation Overview](file:///Users/teixe/dev/mundialito-redondela/docs/README.md)**: Folder conventions and technical scope.

---

## 📦 Imports Convention

Always import shared UI components using the workspace namespace:

```tsx
import { Button, Logo } from "@mr/ui";
```
