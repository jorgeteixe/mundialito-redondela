export const RENDER_VIDEO_TASK_ID = "video.render";

export type RenderVideoPayload = {
  id?: string;
  templateId: string;
  inputProps: Record<string, unknown>;
};

export type RenderVideoOutput = {
  id: string;
  templateId: string;
  publicPath: string;
};
