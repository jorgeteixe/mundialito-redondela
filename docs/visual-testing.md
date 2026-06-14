# Visual Regression Testing 📸

The project uses Vitest Browser Mode and Storycap integration to automate visual regression testing and screenshot capture of Storybook component stories.

---

## How It Works

1.  Vitest runs tests inside a headless Chromium instance managed by Playwright.
2.  Stories are rendered in isolation.
3.  When executing the screenshot target, Vitest captures current components states and outputs PNG screenshots to:
    ```
    packages/ui/artifacts/storybook/
    ```

---

## Usage

To generate and update all Storybook component screenshot snapshots:

```bash
pnpm test:visual
```

`pnpm screenshot:storybook` remains available as an alias for the same workflow.

_Screenshots should be committed whenever shared UI components or stories are updated to keep visual baselines up to date._
