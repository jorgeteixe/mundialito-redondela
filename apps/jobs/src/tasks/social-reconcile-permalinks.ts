import { schedules } from "@trigger.dev/sdk";
import {
  listSocialPostTargetsAwaitingPermalink,
  setSocialPostTargetPermalink,
} from "@mr/db";
import { getSocialWorkerConfig } from "@mr/social-worker/config";
import { fetchPostizPermalinks } from "@mr/social-worker/providers";
import {
  SOCIAL_RECONCILE_PERMALINKS_TASK_ID,
  type SocialReconcilePermalinksOutput,
} from "../contracts";

export const socialReconcilePermalinks = schedules.task({
  id: SOCIAL_RECONCILE_PERMALINKS_TASK_ID,
  cron: "*/5 * * * *",
  run: async (): Promise<SocialReconcilePermalinksOutput> => {
    const config = getSocialWorkerConfig();
    const targets = await listSocialPostTargetsAwaitingPermalink(50);
    if (targets.length === 0) return { updated: 0 };

    const permalinks = await fetchPostizPermalinks(config.postiz);
    let updated = 0;

    for (const target of targets) {
      const permalink = target.providerPostId
        ? permalinks.get(target.providerPostId)
        : undefined;

      if (permalink) {
        await setSocialPostTargetPermalink(target.id, permalink);
        updated += 1;
      }
    }

    return { updated };
  },
});
