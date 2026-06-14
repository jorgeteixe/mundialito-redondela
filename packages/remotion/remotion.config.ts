import path from "node:path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

// @mr/ui ships TSX source whose internals import via the "@/..." alias
// (e.g. "@/lib/utils"). Remotion's bundler transpiles the source but doesn't
// know that alias, so map it to packages/ui/src — same as backstage's tsconfig
// paths ("@/*" -> "../../packages/ui/src/*").
// Resolved from the cwd (the package dir when run via pnpm scripts / pnpm exec);
// __dirname/import.meta are unreliable here because Remotion compiles this config
// to a temp location before evaluating it.
const uiSrc = path.resolve(process.cwd(), "../ui/src");

Config.overrideWebpackConfig((currentConfig) => {
  const config = enableTailwind(currentConfig);
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@": uiSrc,
      },
    },
  };
});
