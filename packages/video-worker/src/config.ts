import os from "node:os";
import path from "node:path";

export type VideoWorkerConfig = {
  workerId: string;
  pollMs: number;
  outputDir: string;
  publicPathPrefix: string;
  once: boolean;
};

function readInt(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getVideoWorkerConfig(): VideoWorkerConfig {
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
    publicPathPrefix:
      process.env.VIDEO_PUBLIC_PATH_PREFIX ?? "/generated/videos",
    once: process.env.VIDEO_WORKER_ONCE === "true",
  };
}
