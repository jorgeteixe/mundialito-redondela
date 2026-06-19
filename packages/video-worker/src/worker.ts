import {
  claimNextVideoGenerationJob,
  markVideoGenerationJobFailed,
  markVideoGenerationJobSucceeded,
  type VideoGenerationJob,
} from "@mr/db";
import type { VideoWorkerConfig } from "./config";
import type { renderVideoGenerationJob } from "./render";

type RenderVideoGenerationJob = typeof renderVideoGenerationJob;

export type VideoWorkerLogger = {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
};

export type VideoJobQueue = {
  claimNext(workerId: string): Promise<VideoGenerationJob | null>;
  markSucceeded(id: string, outputPath: string): Promise<unknown>;
  markFailed(id: string, errorMessage: string): Promise<unknown>;
};

export const databaseVideoJobQueue: VideoJobQueue = {
  claimNext: claimNextVideoGenerationJob,
  markSucceeded: markVideoGenerationJobSucceeded,
  markFailed: markVideoGenerationJobFailed,
};

export function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export const consoleVideoWorkerLogger: VideoWorkerLogger = {
  info: (message) => console.info(message),
  warn: (message) => console.warn(message),
  error: (message) => console.error(message),
};

async function defaultRenderJob(...args: Parameters<RenderVideoGenerationJob>) {
  const { renderVideoGenerationJob } = await import("./render");
  return renderVideoGenerationJob(...args);
}

export async function processNextVideoJob({
  config,
  queue = databaseVideoJobQueue,
  render,
  logger = consoleVideoWorkerLogger,
}: {
  config: VideoWorkerConfig;
  queue?: VideoJobQueue;
  render?: RenderVideoGenerationJob;
  logger?: VideoWorkerLogger;
}) {
  const renderJob = render ?? defaultRenderJob;
  const job = await queue.claimNext(config.workerId);
  if (!job) return false;

  logger.info(
    `[video-worker] picked job=${job.id} template=${job.templateId} attempt=${job.attempts}/${job.maxAttempts}`,
  );

  try {
    logger.info(`[video-worker] rendering job=${job.id}`);
    const result = await renderJob({
      job,
      outputDir: config.outputDir,
      storage: config.storage,
    });
    await queue.markSucceeded(job.id, result.publicPath);
    logger.info(
      `[video-worker] succeeded job=${job.id} output=${result.publicPath}`,
    );
  } catch (error) {
    const message = toErrorMessage(error);
    await queue.markFailed(job.id, message);
    logger.error(`[video-worker] failed job=${job.id} error="${message}"`);
  }

  return true;
}

export async function runVideoWorker({
  config,
  queue = databaseVideoJobQueue,
  logger = consoleVideoWorkerLogger,
}: {
  config: VideoWorkerConfig;
  queue?: VideoJobQueue;
  logger?: VideoWorkerLogger;
}) {
  let keepRunning = true;
  const stop = () => {
    logger.info("[video-worker] stop requested");
    keepRunning = false;
  };

  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  logger.info(
    `[video-worker] started worker=${config.workerId} pollMs=${config.pollMs} outputDir=${config.outputDir}`,
  );

  while (keepRunning) {
    let processed = false;

    try {
      processed = await processNextVideoJob({ config, queue, logger });
    } catch (error) {
      logger.error(`[video-worker] queue error="${toErrorMessage(error)}"`);
      if (config.once) throw error;
    }

    if (config.once) {
      logger.info("[video-worker] stopped after one polling cycle");
      break;
    }

    if (!processed) {
      await new Promise((resolve) => setTimeout(resolve, config.pollMs));
    }
  }

  logger.info("[video-worker] stopped");
}
