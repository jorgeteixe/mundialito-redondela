import os from "node:os";

export type MetaConfig = {
  apiVersion: string;
  igUserId: string;
  pageId: string;
  pageAccessToken: string;
  // Polling for the async Instagram video container (IN_PROGRESS -> FINISHED).
  containerPollMs: number;
  containerPollMaxAttempts: number;
};

export type SocialWorkerConfig = {
  workerId: string;
  pollMs: number;
  once: boolean;
  // Used to turn a stored media path into a public URL Meta can fetch.
  s3PublicBaseUrl: string;
  meta: MetaConfig;
};

function readInt(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for the social worker.`);
  return value;
}

export function getSocialWorkerConfig(): SocialWorkerConfig {
  return {
    workerId:
      process.env.SOCIAL_WORKER_ID ??
      `${os.hostname()}-${process.pid.toString()}`,
    pollMs: readInt("SOCIAL_WORKER_POLL_MS", 5000),
    once: process.env.SOCIAL_WORKER_ONCE === "true",
    s3PublicBaseUrl: process.env.S3_PUBLIC_BASE_URL ?? "http://localhost:9000",
    meta: {
      apiVersion: process.env.META_GRAPH_API_VERSION ?? "v21.0",
      igUserId: required("META_IG_USER_ID"),
      pageId: required("META_PAGE_ID"),
      pageAccessToken: required("META_PAGE_ACCESS_TOKEN"),
      containerPollMs: readInt("META_CONTAINER_POLL_MS", 3000),
      containerPollMaxAttempts: readInt("META_CONTAINER_POLL_MAX_ATTEMPTS", 20),
    },
  };
}
