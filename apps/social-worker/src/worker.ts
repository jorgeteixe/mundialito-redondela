import {
  claimNextSocialPostTarget,
  getSocialPostMediaContext,
  listSocialPostTargetsAwaitingPermalink,
  markSocialPostTargetFailed,
  markSocialPostTargetPublished,
  setSocialPostTargetContainer,
  setSocialPostTargetPermalink,
  type SocialPostMediaContext,
  type SocialPostTarget,
} from "@mr/db";
import type { PostizConfig, SocialWorkerConfig } from "./config";
import { resolveMedia } from "./media";
import {
  createPostizProvider,
  fetchPostizPermalinks,
} from "./providers/postiz";
import type { PublishProvider, SocialWorkerLogger } from "./providers/types";

// How often the idle loop reconciles missing permalinks against Postiz.
const RECONCILE_INTERVAL_MS = 60_000;

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
  markFailed(
    id: string,
    errorMessage: string,
    options?: { retryable?: boolean },
  ): Promise<unknown>;
  listAwaitingPermalink(limit: number): Promise<SocialPostTarget[]>;
  setPermalink(id: string, permalink: string): Promise<unknown>;
};

export const databaseSocialJobQueue: SocialJobQueue = {
  claimNext: claimNextSocialPostTarget,
  loadMediaContext: getSocialPostMediaContext,
  setContainerId: setSocialPostTargetContainer,
  markPublished: markSocialPostTargetPublished,
  markFailed: markSocialPostTargetFailed,
  listAwaitingPermalink: listSocialPostTargetsAwaitingPermalink,
  setPermalink: setSocialPostTargetPermalink,
};

export function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function retryableFromError(error: unknown) {
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

export const consoleSocialWorkerLogger: SocialWorkerLogger = {
  info: (message) => console.info(message),
  warn: (message) => console.warn(message),
  error: (message) => console.error(message),
};

export async function processNextSocialPost({
  config,
  queue = databaseSocialJobQueue,
  provider = createPostizProvider(),
  logger = consoleSocialWorkerLogger,
}: {
  config: SocialWorkerConfig;
  queue?: SocialJobQueue;
  provider?: PublishProvider;
  logger?: SocialWorkerLogger;
}) {
  const target = await queue.claimNext(config.workerId);
  if (!target) return false;

  logger.info(
    `[social-worker] picked target=${target.id} platform=${target.platform} attempt=${target.attempts.toString()}/${target.maxAttempts.toString()}`,
  );

  try {
    const context = await queue.loadMediaContext(target.postId);
    if (!context) throw new Error(`Post ${target.postId} not found.`);

    const media = resolveMedia(
      context.post,
      context.videoOutputPath,
      config.s3PublicBaseUrl,
    );

    const result = await provider.publish(
      { target, post: context.post, media },
      {
        postiz: config.postiz,
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
    const retryable = retryableFromError(error);
    if (retryable === false) {
      await queue.markFailed(target.id, message, { retryable });
    } else {
      await queue.markFailed(target.id, message);
    }
    logger.error(
      `[social-worker] failed target=${target.id} error="${message}"`,
    );
  }

  return true;
}

// Backfills permalinks for already-published targets once Postiz releases them
// (publishing is async, so the permalink isn't known at publish time).
export async function reconcileSocialPermalinks({
  config,
  queue = databaseSocialJobQueue,
  logger = consoleSocialWorkerLogger,
  resolvePermalinks = (postiz: PostizConfig) => fetchPostizPermalinks(postiz),
}: {
  config: SocialWorkerConfig;
  queue?: SocialJobQueue;
  logger?: SocialWorkerLogger;
  resolvePermalinks?: (postiz: PostizConfig) => Promise<Map<string, string>>;
}) {
  const targets = await queue.listAwaitingPermalink(50);
  if (targets.length === 0) return 0;

  const permalinks = await resolvePermalinks(config.postiz);
  let updated = 0;
  for (const target of targets) {
    const permalink = target.providerPostId
      ? permalinks.get(target.providerPostId)
      : undefined;
    if (permalink) {
      await queue.setPermalink(target.id, permalink);
      updated += 1;
    }
  }

  if (updated > 0) {
    logger.info(
      `[social-worker] reconciled ${updated.toString()} permalink(s)`,
    );
  }
  return updated;
}

export async function runSocialWorker({
  config,
  queue = databaseSocialJobQueue,
  provider = createPostizProvider(),
  logger = consoleSocialWorkerLogger,
}: {
  config: SocialWorkerConfig;
  queue?: SocialJobQueue;
  provider?: PublishProvider;
  logger?: SocialWorkerLogger;
}) {
  let keepRunning = true;
  let lastReconcileAt = 0;
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
        provider,
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

    if (Date.now() - lastReconcileAt >= RECONCILE_INTERVAL_MS) {
      lastReconcileAt = Date.now();
      try {
        await reconcileSocialPermalinks({ config, queue, logger });
      } catch (error) {
        logger.warn(
          `[social-worker] reconcile error="${toErrorMessage(error)}"`,
        );
      }
    }

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
