import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { getVideoWorkerConfig } from "./config";

const dbEnvPath = fileURLToPath(new URL("../../db/.env", import.meta.url));

loadEnv({
  path: [".env.local", ".env", dbEnvPath],
});

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required. Set it in the shell or packages/db/.env.",
  );
}

const config = getVideoWorkerConfig();
const { runVideoWorker } = await import("./worker");
await runVideoWorker({ config });

if (config.once) {
  process.exit(0);
}
