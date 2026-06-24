import { logger } from "@trigger.dev/sdk";
import {
  getSocialPostMediaContext,
  getSocialPostTarget,
  markSocialPostTargetFailed,
  markSocialPostTargetPublished,
  setSocialPostTargetContainer,
  startSocialPostTargetPublishing,
} from "@mr/db";
import { getSocialWorkerConfig } from "@mr/social-worker/config";
import { resolveMedia } from "@mr/social-worker/media";
import { createPostizProvider } from "@mr/social-worker/providers";

export const triggerSocialLogger = {
  info: (message: string) => logger.info(message),
  warn: (message: string) => logger.warn(message),
  error: (message: string) => logger.error(message),
};

export function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function retryableFromError(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "retriable" in error &&
    (error as { retriable?: unknown }).retriable === false
  ) {
    return false;
  }

  return undefined;
}

export async function publishSocialTarget(targetId: string) {
  const config = getSocialWorkerConfig();
  const provider = createPostizProvider();
  const claimedTarget = await startSocialPostTargetPublishing(targetId);

  if (!claimedTarget) {
    const existing = await getSocialPostTarget(targetId);
    if (!existing) throw new Error(`Social target ${targetId} not found.`);
    if (existing.status === "published" && existing.providerPostId) {
      return {
        targetId,
        providerPostId: existing.providerPostId,
        permalink: existing.providerPermalink,
      };
    }
    throw new Error(
      `Social target ${targetId} is not publishable from status "${existing.status}".`,
    );
  }

  try {
    const context = await getSocialPostMediaContext(claimedTarget.postId);
    if (!context) throw new Error(`Post ${claimedTarget.postId} not found.`);

    const media = resolveMedia(
      context.post,
      context.videoOutputPath,
      config.s3PublicBaseUrl,
    );

    const result = await provider.publish(
      { target: claimedTarget, post: context.post, media },
      {
        postiz: config.postiz,
        logger: triggerSocialLogger,
        setContainerId: (containerId) =>
          setSocialPostTargetContainer(claimedTarget.id, containerId),
      },
    );

    await markSocialPostTargetPublished(
      claimedTarget.id,
      result.providerPostId,
      result.permalink,
    );

    return {
      targetId,
      providerPostId: result.providerPostId,
      permalink: result.permalink ?? null,
    };
  } catch (error) {
    const message = toErrorMessage(error);
    const retryable = retryableFromError(error);
    await markSocialPostTargetFailed(claimedTarget.id, message, {
      retryable,
    });
    throw error;
  }
}
