import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

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

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const apiUrlArgs = process.env.TRIGGER_API_URL
  ? ["--api-url", process.env.TRIGGER_API_URL]
  : [];

mkdirSync(".trigger/tmp/store", { recursive: true });

const child = spawn("trigger", [...args, ...apiUrlArgs], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
