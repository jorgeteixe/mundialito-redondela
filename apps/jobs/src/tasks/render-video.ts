import { randomUUID } from "node:crypto";
import { logger, task } from "@trigger.dev/sdk";
import { getVideoWorkerConfig } from "@mr/video-worker/config";
import { renderVideoGenerationJob } from "@mr/video-worker/render";
import {
  RENDER_VIDEO_TASK_ID,
  type RenderVideoPayload,
  type RenderVideoOutput,
} from "../contracts";

const DEFAULT_OUTPUT_DIR = "/tmp/mr-trigger-video-renders";

export const renderVideo = task({
  id: RENDER_VIDEO_TASK_ID,
  run: async (payload: RenderVideoPayload): Promise<RenderVideoOutput> => {
    const renderId = payload.id ?? randomUUID();
    const outputDir = DEFAULT_OUTPUT_DIR;
    const config = getVideoWorkerConfig();

    logger.info("Trigger.dev video render started", {
      renderId,
      templateId: payload.templateId,
      outputDir,
    });

    const result = await renderVideoGenerationJob({
      job: {
        id: renderId,
        templateId: payload.templateId,
        kind: "video",
        inputProps: payload.inputProps,
      },
      outputDir,
      storage: config.storage,
    });

    logger.info("Trigger.dev video render uploaded", {
      renderId,
      publicPath: result.publicPath,
    });

    return {
      id: renderId,
      templateId: payload.templateId,
      publicPath: result.publicPath,
      outputLocation: result.outputLocation,
    };
  },
});
