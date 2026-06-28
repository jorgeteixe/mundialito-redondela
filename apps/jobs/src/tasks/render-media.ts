import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { logger, task } from "@trigger.dev/sdk";
import { TEMPLATE_DEFINITIONS } from "@mr/remotion/templates";
import {
  getVideoGenerationJob,
  markVideoGenerationJobFailed,
  markVideoGenerationJobSucceeded,
  startVideoGenerationJob,
} from "@mr/db";
import { getVideoWorkerConfig } from "@mr/video-worker/config";
import { renderGenerationJob } from "@mr/video-worker/render";
import {
  RENDER_MEDIA_TASK_ID,
  type RenderMediaPayload,
  type RenderMediaOutput,
} from "../contracts";

const DEFAULT_OUTPUT_DIR = "/tmp/mr-trigger-media-renders";

export const renderMedia = task({
  id: RENDER_MEDIA_TASK_ID,
  // Remotion render = runtime webpack bundle + headless Chromium + ffmpeg.
  // The default small-1x preset (0.5 GB) OOM-kills the process mid-render.
  machine: "large-1x",
  // Bundling at runtime is slow; give the render more headroom than the
  // global 60s default so a cold bundle + render doesn't trip the timeout.
  maxDuration: 300,
  run: async (payload: RenderMediaPayload): Promise<RenderMediaOutput> => {
    const renderId = payload.id ?? payload.jobId ?? randomUUID();
    const outputDir = DEFAULT_OUTPUT_DIR;
    const config = getVideoWorkerConfig();
    const dbJob = payload.jobId
      ? await startVideoGenerationJob(payload.jobId)
      : null;
    const existingJob =
      payload.jobId && !dbJob
        ? await getVideoGenerationJob(payload.jobId)
        : null;
    const source = dbJob ?? existingJob ?? payload;
    const template = TEMPLATE_DEFINITIONS.find(
      (candidate) => candidate.id === source.templateId,
    );

    if (!template) {
      throw new Error(`Unknown template: ${source.templateId}`);
    }

    // A trigger arrived for a job this run could not claim (dbJob is null):
    // it's a duplicate/replay while another run owns it, or it already finished.
    // Return idempotently instead of failing the run.
    if (payload.jobId && !dbJob) {
      if (!existingJob) {
        throw new Error(`Media job ${payload.jobId} not found.`);
      }

      if (existingJob.status === "succeeded" && existingJob.outputPath) {
        return {
          id: renderId,
          jobId: existingJob.id,
          templateId: existingJob.templateId,
          kind: existingJob.kind,
          publicPath: existingJob.outputPath,
          skipped: true,
        };
      }

      logger.info("Trigger.dev media render skipped: job not renderable", {
        renderId,
        jobId: payload.jobId,
        status: existingJob.status,
      });
      return {
        id: renderId,
        jobId: existingJob.id,
        templateId: existingJob.templateId,
        kind: existingJob.kind,
        publicPath: existingJob.outputPath ?? null,
        skipped: true,
      };
    }

    logger.info("Trigger.dev media render started", {
      renderId,
      jobId: payload.jobId ?? null,
      templateId: source.templateId,
      kind: template.kind,
      outputDir,
    });

    try {
      const result = await renderGenerationJob({
        job: {
          id: renderId,
          templateId: source.templateId,
          kind: template.kind,
          inputProps: source.inputProps,
        },
        outputDir,
        storage: config.storage,
      });

      await rm(result.outputLocation, { force: true });

      if (payload.jobId) {
        await markVideoGenerationJobSucceeded(payload.jobId, result.publicPath);
      }

      logger.info("Trigger.dev media render uploaded", {
        renderId,
        jobId: payload.jobId ?? null,
        kind: template.kind,
        publicPath: result.publicPath,
      });

      return {
        id: renderId,
        jobId: payload.jobId ?? null,
        templateId: source.templateId,
        kind: template.kind,
        publicPath: result.publicPath,
      };
    } catch (error) {
      if (payload.jobId) {
        await markVideoGenerationJobFailed(
          payload.jobId,
          error instanceof Error ? error.message : String(error),
        );
      }
      throw error;
    }
  },
});
