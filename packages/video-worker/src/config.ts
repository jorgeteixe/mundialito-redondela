import os from "node:os";
import path from "node:path";

export type VideoWorkerConfig = {
  workerId: string;
  pollMs: number;
  outputDir: string;
  storage: S3StorageConfig;
  once: boolean;
};

export type S3StorageConfig = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
  forcePathStyle: boolean;
  applyPublicReadPolicy: boolean;
};

function readInt(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getVideoWorkerConfig(): VideoWorkerConfig {
  const s3Endpoint = process.env.S3_ENDPOINT ?? "http://localhost:9000";
  return {
    workerId:
      process.env.VIDEO_WORKER_ID ??
      `${os.hostname()}-${process.pid.toString()}`,
    pollMs: readInt("VIDEO_WORKER_POLL_MS", 5000),
    outputDir:
      process.env.VIDEO_OUTPUT_DIR ??
      path.resolve(
        process.cwd(),
        "../../apps/backstage/public/generated/videos",
      ),
    storage: {
      endpoint: s3Endpoint,
      region: process.env.S3_REGION ?? "auto",
      bucket: process.env.S3_BUCKET ?? "mundialito-videos",
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "mundialito",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "mundialito",
      publicBaseUrl: process.env.S3_PUBLIC_BASE_URL ?? "http://localhost:9000",
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
      applyPublicReadPolicy:
        process.env.S3_APPLY_PUBLIC_READ_POLICY === "true" ||
        (!process.env.S3_APPLY_PUBLIC_READ_POLICY &&
          s3Endpoint.includes("localhost")),
    },
    once: process.env.VIDEO_WORKER_ONCE === "true",
  };
}
