import { task } from "@trigger.dev/sdk";
import {
  SOCIAL_PUBLISH_TASK_ID,
  type SocialPublishOutput,
  type SocialPublishPayload,
} from "../contracts";
import { publishSocialTarget } from "../social";

export const socialPublish = task({
  id: SOCIAL_PUBLISH_TASK_ID,
  run: async (payload: SocialPublishPayload): Promise<SocialPublishOutput> => {
    return publishSocialTarget(payload.targetId);
  },
});
