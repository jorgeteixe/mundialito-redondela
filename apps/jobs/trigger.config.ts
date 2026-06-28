import {
  additionalFiles,
  additionalPackages,
  aptGet,
} from "@trigger.dev/build/extensions/core";
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
      // Remotion downloads Chrome Headless Shell at runtime, but the slim
      // deploy image lacks the system shared libraries Chromium links against
      // (libnspr4.so etc.). Install Remotion's Linux dependency set so the
      // browser process can launch.
      aptGet({
        packages: [
          "libnss3",
          "libdbus-1-3",
          "libatk1.0-0",
          "libgbm1",
          "libasound2",
          "libxrandr2",
          "libxkbcommon-dev",
          "libxfixes3",
          "libxcomposite1",
          "libxdamage1",
          "libatk-bridge2.0-0",
          "libpango-1.0-0",
          "libcairo2",
          "libcups2",
        ],
      }),
      additionalFiles({
        files: ["../../packages/remotion/src/**", "../../packages/ui/src/**"],
      }),
      // The Remotion source above is shipped as raw files and re-bundled by
      // webpack AT RUNTIME (render.ts → bundle()). esbuild never sees its
      // imports, so their packages aren't auto-installed into the image and
      // `external` won't add them either (external only keeps *imported* deps).
      // Force-install everything the runtime bundle of remotion-entry.ts needs.
      additionalPackages({
        packages: [
          // Remotion runtime + composition schema validation.
          "remotion@4.0.477",
          "@remotion/google-fonts@4.0.477",
          "react@19.2.0",
          "react-dom@19.2.0",
          "zod@4.3.6",
          // @mr/ui is aliased to its source barrel (index.ts) in the bundle,
          // which re-exports every component, so the runtime bundle needs all
          // of @mr/ui's runtime deps available too.
          "class-variance-authority@^0.7.1",
          "clsx@^2.1.1",
          "date-fns@^4.4.0",
          "lucide-react@^1.18.0",
          "next-themes@^0.4.6",
          "radix-ui@^1.5.0",
          "react-day-picker@^10.0.1",
          "sonner@^2.0.7",
          "tailwind-merge@^3.6.0",
          "@fontsource-variable/inter@^5.2.8",
          // Imported by the UI tailwind stylesheet, resolved by the tailwind
          // webpack loader during the runtime bundle.
          "tw-animate-css@^1.4.0",
          "shadcn@^4.11.0",
        ],
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
