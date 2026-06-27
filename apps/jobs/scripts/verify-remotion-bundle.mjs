// Runs the SAME Remotion webpack bundle that render.ts performs at runtime,
// but from inside a freshly-installed deploy build dir — so module resolution
// mirrors the deployed image (flat node_modules of only the deployed deps),
// NOT the workspace (which hoists everything and masks missing deps).
//
// Invoked by scripts/verify-deploy-bundle.sh with cwd = the dry-run build dir.
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { enableTailwind } from "@remotion/tailwind-v4";

const root = process.cwd();
const entryPoint = path.resolve(
  root,
  "packages/remotion/src/remotion-entry.ts",
);
const uiSrc = path.resolve(root, "packages/ui/src");

console.log(`Bundling ${entryPoint}`);
await bundle({
  entryPoint,
  // Keep this in sync with getServeUrl() in apps/video-worker/src/render.ts.
  webpackOverride: (currentConfig) => {
    const config = enableTailwind(currentConfig);
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          "@mr/ui$": path.resolve(uiSrc, "index.ts"),
          "@": uiSrc,
        },
      },
    };
  },
});
console.log("✅ Remotion bundle resolved every module from the deploy graph");
