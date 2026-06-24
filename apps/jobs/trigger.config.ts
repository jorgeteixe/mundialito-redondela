import { additionalFiles } from "@trigger.dev/build/extensions/core";
import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: "proj_glhthldaniregplmysfd",
  dirs: ["./src/tasks"],
  maxDuration: 60,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 1,
    },
  },
  build: {
    extensions: [
      additionalFiles({
        files: ["../../packages/remotion/src/**", "../../packages/ui/src/**"],
      }),
    ],
    external: [
      "@remotion/bundler",
      "@remotion/renderer",
      "@remotion/tailwind-v4",
      "@rspack/binding",
      "@rspack/core",
    ],
  },
  logLevel: "log",
});
