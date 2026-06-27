import { task } from "@trigger.dev/sdk";
import {
  getSocialPost,
  listSocialPostTargetsForPost,
  setSocialPostMediaUrl,
} from "@mr/db";
import {
  PUBLICATION_PUBLISH_TASK_ID,
  type PublicationPublishOutput,
  type PublicationPublishPayload,
} from "../contracts";
import { renderMedia } from "./render-media";
import { socialPublish } from "./social-publish";

export const publicationPublish = task({
  id: PUBLICATION_PUBLISH_TASK_ID,
  run: async (
    payload: PublicationPublishPayload,
  ): Promise<PublicationPublishOutput> => {
    const post = await getSocialPost(payload.postId);
    if (!post) throw new Error(`Post ${payload.postId} not found.`);

    let mediaUrl = post.mediaUrl;

    if (payload.render) {
      const result = await renderMedia
        .triggerAndWait({
          id: payload.render.id,
          templateId: payload.render.templateId,
          inputProps: payload.render.inputProps,
        })
        .unwrap();

      if (result.kind !== post.mediaKind) {
        throw new Error(
          `Rendered media kind "${result.kind}" does not match post media kind "${post.mediaKind}".`,
        );
      }

      if (!result.publicPath) {
        throw new Error(
          `Render for post ${post.id} produced no media (skipped=${result.skipped ?? false}).`,
        );
      }

      mediaUrl = result.publicPath;
      await setSocialPostMediaUrl(post.id, result.publicPath);
    }

    const targets = await listSocialPostTargetsForPost(post.id);
    await socialPublish.batchTrigger(
      targets.map((target) => ({ payload: { targetId: target.id } })),
    );

    return {
      postId: post.id,
      mediaUrl,
      targetCount: targets.length,
    };
  },
});
