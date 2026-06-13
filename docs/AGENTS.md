# Agent Documentation Guidelines 🤖

This file serves as a guide for AI agents (coding assistants) on how to manage, create, and update files in the `docs/` directory.

## Guidelines for Agents

### 1. What to Save Here

- **Complex Workflows**: Any newly introduced scripts, build chains, or asset generation pipelines (like Playwright, screenshots, or testing pipelines) must be documented in a separate file inside `docs/` rather than cluttering the root `README.md`.
- **Architectural Shifts**: If you refactor key components, state machines, or data structures, document the layout here.
- **Developer Tooling Setup**: Documentation of new command flags, plugins, or configurations.

### 2. What NOT to Save Here

- **Root Documentation**: Do not move the main entry point from the root `README.md` — keep it as the primary overview and link out to files in `docs/`.
- **Temporary Logs or Outputs**: Generated visual regression images must go to `packages/ui/artifacts/storybook/` and Open Graph outputs must go to `apps/web/public/`. No media assets or build artifacts should be saved in `docs/`.
- **Sample Code/Demos**: Keep sample codes out of this directory unless it is part of the documentation as fenced markdown blocks.

### 3. File Creation Rules

- Use descriptive, kebab-cased filenames (e.g. `open-graph-generation.md`, `visual-testing.md`).
- Keep the root `README.md` updated with links to any new guides you add here.
