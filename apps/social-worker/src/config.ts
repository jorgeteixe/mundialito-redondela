import os from "node:os";

export type PostizConfig = {
  apiUrl: string;
  apiKey: string;
  // Optional explicit channel ids. When unset the provider resolves them from
  // GET /integrations by matching the channel identifier to the platform.
  integrationIds: {
    instagram?: string;
    facebook?: string;
  };
};

export type SocialWorkerConfig = {
  workerId: string;
  pollMs: number;
  once: boolean;
  // Used to turn a stored media path into a public URL the provider can fetch.
  s3PublicBaseUrl: string;
  postiz: PostizConfig;
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
    postiz: {
      apiUrl: process.env.POSTIZ_API_URL ?? "https://api.postiz.com/public/v1",
      apiKey: required("POSTIZ_API_KEY"),
      integrationIds: {
        instagram: process.env.POSTIZ_INSTAGRAM_INTEGRATION_ID,
        facebook: process.env.POSTIZ_FACEBOOK_INTEGRATION_ID,
      },
    },
  };
}
