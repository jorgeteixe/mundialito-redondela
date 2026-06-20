import {
  claimNextSocialPostTarget,
  getSocialPostMediaContext,
  markSocialPostTargetFailed,
  markSocialPostTargetPublished,
  setSocialPostTargetContainer,
  type SocialPostMediaContext,
  type SocialPostTarget,
} from "@mr/db";
import type { SocialWorkerConfig } from "./config";
import { resolveMedia } from "./media";
import { createProviderRegistry, type ProviderRegistry } from "./providers";
import type { SocialWorkerLogger } from "./providers/types";

export type { SocialWorkerLogger } from "./providers/types";

export type SocialJobQueue = {
  claimNext(workerId: string): Promise<SocialPostTarget | null>;
  loadMediaContext(postId: string): Promise<SocialPostMediaContext | null>;
  setContainerId(id: string, containerId: string): Promise<unknown>;
  markPublished(
    id: string,
    providerPostId: string,
    permalink?: string | null,
  ): Promise<unknown>;
  markFailed(id: string, errorMessage: string): Promise<unknown>;
};

export const databaseSocialJobQueue: SocialJobQueue = {
  claimNext: claimNextSocialPostTarget,
  loadMediaContext: getSocialPostMediaContext,
  setContainerId: setSocialPostTargetContainer,
  markPublished: markSocialPostTargetPublished,
  markFailed: markSocialPostTargetFailed,
};

export function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export const consoleSocialWorkerLogger: SocialWorkerLogger = {
  info: (message) => console.info(message),
  warn: (message) => console.warn(message),
  error: (message) => console.error(message),
};

export async function processNextSocialPost({
  config,
  queue = databaseSocialJobQueue,
  providers,
  logger = consoleSocialWorkerLogger,
}: {
  config: SocialWorkerConfig;
  queue?: SocialJobQueue;
  providers?: ProviderRegistry;
  logger?: SocialWorkerLogger;
}) {
  const registry = providers ?? createProviderRegistry();
  const target = await queue.claimNext(config.workerId);
  if (!target) return false;

  logger.info(
    `[social-worker] picked target=${target.id} platform=${target.platform} provider=${target.provider} attempt=${target.attempts.toString()}/${target.maxAttempts.toString()}`,
  );

  try {
    const context = await queue.loadMediaContext(target.postId);
    if (!context) throw new Error(`Post ${target.postId} not found.`);

    const media = resolveMedia(
      context.post,
      context.videoOutputPath,
      config.s3PublicBaseUrl,
    );

    const provider = registry[target.provider];
    if (!provider) {
      throw new Error(`No provider registered for "${target.provider}".`);
    }

    const result = await provider.publish(
      { target, post: context.post, media },
      {
        meta: config.meta,
        logger,
        setContainerId: (containerId) =>
          queue.setContainerId(target.id, containerId),
      },
    );

    await queue.markPublished(
      target.id,
      result.providerPostId,
      result.permalink,
    );
    logger.info(
      `[social-worker] published target=${target.id} providerPostId=${result.providerPostId}`,
    );
  } catch (error) {
    const message = toErrorMessage(error);
    await queue.markFailed(target.id, message);
    logger.error(
      `[social-worker] failed target=${target.id} error="${message}"`,
    );
  }

  return true;
}

export async function runSocialWorker({
  config,
  queue = databaseSocialJobQueue,
  providers,
  logger = consoleSocialWorkerLogger,
}: {
  config: SocialWorkerConfig;
  queue?: SocialJobQueue;
  providers?: ProviderRegistry;
  logger?: SocialWorkerLogger;
}) {
  const registry = providers ?? createProviderRegistry();
  let keepRunning = true;
  // When idle we sleep on a timer; stop() resolves it early so shutdown is
  // prompt instead of waiting out a full poll interval.
  let wakeFromIdle: (() => void) | null = null;
  const stop = () => {
    logger.info(
      "[social-worker] stop requested; will finish current job and exit",
    );
    keepRunning = false;
    wakeFromIdle?.();
  };

  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  logger.info(
    `[social-worker] started worker=${config.workerId} pollMs=${config.pollMs.toString()}`,
  );

  while (keepRunning) {
    let processed = false;

    try {
      processed = await processNextSocialPost({
        config,
        queue,
        providers: registry,
        logger,
      });
    } catch (error) {
      logger.error(`[social-worker] queue error="${toErrorMessage(error)}"`);
      if (config.once) throw error;
    }

    if (config.once) {
      logger.info("[social-worker] stopped after one polling cycle");
      break;
    }

    if (!keepRunning) break;

    if (!processed) {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, config.pollMs);
        wakeFromIdle = () => {
          clearTimeout(timer);
          resolve();
        };
      });
      wakeFromIdle = null;
    }
  }

  logger.info("[social-worker] stopped");
}
