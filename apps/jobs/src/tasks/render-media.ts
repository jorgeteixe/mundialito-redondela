import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { logger, task } from "@trigger.dev/sdk";
import { TEMPLATE_DEFINITIONS } from "@mr/remotion/templates";
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
  run: async (payload: RenderMediaPayload): Promise<RenderMediaOutput> => {
    const renderId = payload.id ?? randomUUID();
    const outputDir = DEFAULT_OUTPUT_DIR;
    const config = getVideoWorkerConfig();
    const template = TEMPLATE_DEFINITIONS.find(
      (candidate) => candidate.id === payload.templateId,
    );

    if (!template) {
      throw new Error(`Unknown template: ${payload.templateId}`);
    }

    logger.info("Trigger.dev media render started", {
      renderId,
      templateId: payload.templateId,
      kind: template.kind,
      outputDir,
    });

    const result = await renderGenerationJob({
      job: {
        id: renderId,
        templateId: payload.templateId,
        kind: template.kind,
        inputProps: payload.inputProps,
      },
      outputDir,
      storage: config.storage,
    });

    await rm(result.outputLocation, { force: true });

    logger.info("Trigger.dev media render uploaded", {
      renderId,
      kind: template.kind,
      publicPath: result.publicPath,
    });

    return {
      id: renderId,
      templateId: payload.templateId,
      kind: template.kind,
      publicPath: result.publicPath,
    };
  },
});
