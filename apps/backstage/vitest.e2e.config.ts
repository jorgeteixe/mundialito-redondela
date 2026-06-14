import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: [path.join(dirname, "tests/global-setup.ts")],
    include: ["tests/**/*.spec.{ts,tsx}"],
    hookTimeout: 60_000,
    testTimeout: 60_000,
  },
});
