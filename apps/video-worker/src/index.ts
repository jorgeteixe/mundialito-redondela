import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { getVideoWorkerConfig } from "./config";

const rootEnvLocalPath = fileURLToPath(
  new URL("../../../.env.local", import.meta.url),
);
const rootEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));
const appEnvLocalPath = fileURLToPath(
  new URL("../.env.local", import.meta.url),
);
const appEnvPath = fileURLToPath(new URL("../.env", import.meta.url));

loadEnv({
  path: [appEnvLocalPath, appEnvPath, rootEnvLocalPath, rootEnvPath],
});

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required. Set it in the shell or root .env.",
  );
}

const config = getVideoWorkerConfig();
const { runVideoWorker } = await import("./worker");
await runVideoWorker({ config });

// runVideoWorker only resolves after the in-flight job (if any) has drained, so
// the DB writes are committed. The postgres pool keeps the event loop alive, so
// exit explicitly instead of lingering — otherwise the dev watcher would have to
// force-kill us on restart.
process.exit(0);
