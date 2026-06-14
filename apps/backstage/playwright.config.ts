import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://localhost:3002",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "next dev --port 3002",
    url: "http://localhost:3002",
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL:
        "postgresql://mundialito:mundialito@localhost:5432/mundialito_test",
      BETTER_AUTH_SECRET: "test-secret-do-not-use-in-production",
      BETTER_AUTH_URL: "http://localhost:3002",
      NEXT_PUBLIC_BETTER_AUTH_URL: "http://localhost:3002",
    },
    timeout: 120_000,
  },
  globalSetup: "./tests/global-setup.ts",
  globalTeardown: "./tests/global-teardown.ts",
});
