export const DUMMY_HEALTH_CHECK_TASK_ID = "dummy.health-check";
export const RENDER_VIDEO_TASK_ID = "video.render";

export type DummyHealthCheckPayload = {
  message?: string;
};

export type DummyHealthCheckOutput = {
  ok: true;
  receivedMessage: string | null;
  timestamp: string;
};

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
