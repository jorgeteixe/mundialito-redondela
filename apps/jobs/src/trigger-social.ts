import { configure } from "@trigger.dev/sdk";
import { config as loadEnv } from "dotenv";
import { socialPublish } from "./tasks/social-publish";

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

const [targetId] = process.argv.slice(2);

if (!targetId) {
  throw new Error("Usage: pnpm jobs:social <targetId>");
}

const handle = await socialPublish.trigger({ targetId });

console.info(
  `[jobs] triggered ${handle.taskIdentifier} run=${handle.id} target=${targetId}`,
);
