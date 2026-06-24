import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_glhthldaniregplmysfd",
  dirs: ["./src/tasks"],
  maxDuration: 60,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 1,
    },
  },
  logLevel: "log",
});
