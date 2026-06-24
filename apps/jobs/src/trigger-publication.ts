import { configure } from "@trigger.dev/sdk";
import { config as loadEnv } from "dotenv";
import { publicationPublish } from "./tasks/publication-publish";
import type { PublicationPublishPayload } from "./contracts";

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

const [postId, rawRender] = process.argv.slice(2);

if (!postId) {
  throw new Error(
    'Usage: pnpm jobs:publication <postId> \'{"templateId":"countdown-post","inputProps":{"daysLeft":7}}\'',
  );
}

const payload: PublicationPublishPayload = {
  postId,
  render: rawRender
    ? (JSON.parse(rawRender) as PublicationPublishPayload["render"])
    : undefined,
};

const handle = await publicationPublish.trigger(payload);

console.info(
  `[jobs] triggered ${handle.taskIdentifier} run=${handle.id} post=${postId}`,
);
