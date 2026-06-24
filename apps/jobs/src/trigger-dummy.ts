import { configure } from "@trigger.dev/sdk";
import { config as loadEnv } from "dotenv";
import { dummyHealthCheck } from "./tasks/dummy-health-check";

loadEnv({ path: ["../../.env.local", "../../.env"] });

if (!process.env.TRIGGER_SECRET_KEY) {
  throw new Error(
    "TRIGGER_SECRET_KEY is required. Copy the project secret key from Trigger.dev dashboard into root .env or .env.local.",
  );
}

if (!process.env.TRIGGER_API_URL) {
  throw new Error(
    "TRIGGER_API_URL is required. Set it to your Trigger.dev instance URL, for example https://trigger.teixe.es.",
  );
}

configure({
  secretKey: process.env.TRIGGER_SECRET_KEY,
  baseURL: process.env.TRIGGER_API_URL,
});

const message = process.argv.slice(2).join(" ").trim() || undefined;

const handle = await dummyHealthCheck.trigger({
  message,
});

console.info(
  `[jobs] triggered ${handle.taskIdentifier} run=${handle.id} message=${message ?? "<none>"}`,
);
