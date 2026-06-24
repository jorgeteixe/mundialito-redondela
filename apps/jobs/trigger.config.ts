import { additionalFiles } from "@trigger.dev/build/extensions/core";
import { defineConfig } from "@trigger.dev/sdk";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

export default defineConfig({
  project: required("TRIGGER_PROJECT_REF"),
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
