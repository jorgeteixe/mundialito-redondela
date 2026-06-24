export const RENDER_MEDIA_TASK_ID = "media.render";

export type RenderMediaPayload = {
  id?: string;
  templateId: string;
  inputProps: Record<string, unknown>;
};

export type RenderMediaOutput = {
  id: string;
  templateId: string;
  kind: "video" | "image";
  publicPath: string;
};
