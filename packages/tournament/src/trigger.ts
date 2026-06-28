// Plain (framework-free) trigger helper, shared by the backstage server action
// and the Telegram agent. Mirrors apps/backstage/lib/trigger.ts but without the
// Next.js "use server" boundary so non-Next callers can use it too.

const RESULTS_PUBLISH_AFTER_SAVE_TASK_ID = "results.publish-after-save";

export type ResultsPublishAfterSavePayload = {
  matchId: string;
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
        "x-trigger-source": "tournament",
      },
      body: JSON.stringify({ payload }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Trigger task ${taskId} failed to start: ${response.status} ${await response.text()}`,
    );
  }

  return (await response.json()) as TriggerRunHandle;
}

export async function triggerResultsPublishAfterSave(
  payload: ResultsPublishAfterSavePayload,
) {
  return triggerTask(RESULTS_PUBLISH_AFTER_SAVE_TASK_ID, payload);
}
