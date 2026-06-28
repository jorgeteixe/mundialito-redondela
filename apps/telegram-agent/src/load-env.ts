// Side-effect module: load env from the same locations as the other apps,
// BEFORE any module that reads process.env at import time (e.g. @mr/db's client
// reads DATABASE_URL on import). Keep this the first import in the entrypoint.
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const appEnvLocalPath = fileURLToPath(
  new URL("../.env.local", import.meta.url),
);
const appEnvPath = fileURLToPath(new URL("../.env", import.meta.url));
const rootEnvLocalPath = fileURLToPath(
  new URL("../../../.env.local", import.meta.url),
);
const rootEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));

loadEnv({
  path: [appEnvLocalPath, appEnvPath, rootEnvLocalPath, rootEnvPath],
});
