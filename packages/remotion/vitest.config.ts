import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The registry imports composition Components, one of which pulls in @mr/ui,
// whose internals import via "@/...". Map that to packages/ui/src so the test
// suite can load the module graph. Regex form so it matches "@/foo" only and
// leaves the "@mr/ui" package specifier untouched.
const uiSrc = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../ui/src",
);

export default defineConfig({
  resolve: {
    alias: [{ find: /^@\/(.*)$/, replacement: `${uiSrc}/$1` }],
  },
});
