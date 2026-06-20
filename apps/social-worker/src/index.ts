import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { getSocialWorkerConfig } from "./config";

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

const config = getSocialWorkerConfig();
const { runSocialWorker } = await import("./worker");
await runSocialWorker({ config });

// runSocialWorker only resolves after the in-flight job (if any) has drained, so
// the DB writes are committed. The postgres pool keeps the event loop alive, so
// exit explicitly instead of lingering.
process.exit(0);
