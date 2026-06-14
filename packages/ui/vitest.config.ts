import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import react from "@vitejs/plugin-react";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import storycap from "@storycap-testrun/browser/vitest-plugin";

import { playwright } from "@vitest/browser-playwright";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(dirname, "src"),
    },
  },
  test: {
    projects: [
      {
        plugins: [react()],
        resolve: {
          alias: {
            "@": path.join(dirname, "src"),
          },
        },
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          passWithNoTests: true,
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
          storycap({
            output: {
              dir: path.join(dirname, "artifacts/storybook"),
              file: "[id].png",
            },
            viewport: {
              width: 900,
              height: 600,
            },
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: ["./.storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
