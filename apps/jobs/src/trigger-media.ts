import { randomUUID } from "node:crypto";
import { configure } from "@trigger.dev/sdk";
import { config as loadEnv } from "dotenv";
import { renderMedia } from "./tasks/render-media";

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

const [templateId, rawInputProps] = process.argv.slice(2);

if (!templateId) {
  throw new Error(
    'Usage: pnpm jobs:media <templateId> \'{"title":"Example"}\'',
  );
}

const inputProps = rawInputProps
  ? (JSON.parse(rawInputProps) as Record<string, unknown>)
  : {};

const handle = await renderMedia.trigger({
  id: randomUUID(),
  templateId,
  inputProps,
});

console.info(
  `[jobs] triggered ${handle.taskIdentifier} run=${handle.id} template=${templateId}`,
);
