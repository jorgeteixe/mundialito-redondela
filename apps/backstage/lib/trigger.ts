"use server";

const RENDER_MEDIA_TASK_ID = "media.render";
const PUBLICATION_PUBLISH_TASK_ID = "publication.publish";
const SOCIAL_PUBLISH_TASK_ID = "social.publish";

export type RenderMediaPayload = {
  id?: string;
  jobId?: string;
  templateId: string;
  inputProps: Record<string, unknown>;
};

export type PublicationPublishPayload = {
  postId: string;
  render?: {
    id?: string;
    templateId: string;
    inputProps: Record<string, unknown>;
  };
};

export type SocialPublishPayload = {
  targetId: string;
};

type TriggerRunHandle = {
  id: string;
  isCached?: boolean;
};

async function triggerTask(taskId: string, payload: unknown) {
  const secretKey = process.env.TRIGGER_SECRET_KEY;
  const baseUrl = process.env.TRIGGER_API_URL;

  if (!secretKey) {
    throw new Error("Missing TRIGGER_SECRET_KEY.");
  }

  if (!baseUrl) {
    throw new Error("Missing TRIGGER_API_URL.");
  }

  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/v1/tasks/${encodeURIComponent(taskId)}/trigger`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
        "x-trigger-source": "backstage",
      },
      body: JSON.stringify({
        payload,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Trigger task ${taskId} failed to start: ${response.status} ${await response.text()}`,
    );
  }

  return (await response.json()) as TriggerRunHandle;
}

export async function triggerMediaRender(payload: RenderMediaPayload) {
  return triggerTask(RENDER_MEDIA_TASK_ID, payload);
}

export async function triggerPublicationPublish(
  payload: PublicationPublishPayload,
) {
  return triggerTask(PUBLICATION_PUBLISH_TASK_ID, payload);
}

export async function triggerSocialPublish(payload: SocialPublishPayload) {
  return triggerTask(SOCIAL_PUBLISH_TASK_ID, payload);
}
