// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import { globalIgnores } from "eslint/config";
import storybook from "eslint-plugin-storybook";

import { config } from "@mr/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default [
  globalIgnores(["storybook-static/**", "artifacts/**", ".turbo/**"]),
  ...config,
  ...storybook.configs["flat/recommended"],
  {
    // shadcn primitives are CLI-generated and not hand-edited; prop-types are
    // redundant in this TypeScript codebase.
    files: ["src/ui/**"],
    rules: { "react/prop-types": "off" },
  },
];
