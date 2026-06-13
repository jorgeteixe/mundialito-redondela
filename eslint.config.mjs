import { globalIgnores } from "eslint/config";

import { config as reactConfig } from "@mr/eslint-config/react-internal";

export default [
  globalIgnores([
    "**/.next/**",
    "**/.turbo/**",
    "**/storybook-static/**",
    "**/node_modules/**",
  ]),
  ...reactConfig,
];
