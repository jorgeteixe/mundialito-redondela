import { describe, expect, it, vi } from "vitest";
import type { VideoGenerationJob } from "@mr/db";
import {
  processNextVideoJob,
  toErrorMessage,
  type VideoJobQueue,
  type VideoWorkerLogger,
} from "./worker";

const silentLogger: VideoWorkerLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

const baseJob: VideoGenerationJob = {
  id: "11111111-1111-1111-1111-111111111111",
  templateId: "hello-world",
  kind: "video",
  inputProps: { title: "Mundialito Redondela" },
  status: "running",
  priority: 0,
  attempts: 1,
  maxAttempts: 3,
  lockedAt: new Date(),
  lockedBy: "test-worker",
  startedAt: new Date(),
  finishedAt: null,
  failedAt: null,
  errorMessage: null,
  outputPath: null,
  createdByUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createQueue(job: VideoGenerationJob | null): VideoJobQueue {
  return {
    claimNext: vi.fn().mockResolvedValue(job),
    markSucceeded: vi.fn().mockResolvedValue(null),
    markFailed: vi.fn().mockResolvedValue(null),
  };
}

describe("processNextVideoJob", () => {
  it("returns false when no queued job exists", async () => {
    const queue = createQueue(null);

    await expect(
      processNextVideoJob({
        config: {
          workerId: "test-worker",
          pollMs: 1,
          outputDir: "/tmp/videos",
          publicPathPrefix: "/generated/videos",
          once: true,
        },
        queue,
        logger: silentLogger,
      }),
    ).resolves.toBe(false);

    expect(queue.markSucceeded).not.toHaveBeenCalled();
    expect(queue.markFailed).not.toHaveBeenCalled();
  });

  it("marks claimed job succeeded after render", async () => {
    const queue = createQueue(baseJob);

    await expect(
      processNextVideoJob({
        config: {
          workerId: "test-worker",
          pollMs: 1,
          outputDir: "/tmp/videos",
          publicPathPrefix: "/generated/videos",
          once: true,
        },
        queue,
        logger: silentLogger,
        render: vi.fn().mockResolvedValue({
          outputLocation: "/tmp/videos/job.mp4",
          publicPath: "/generated/videos/job.mp4",
        }),
      }),
    ).resolves.toBe(true);

    expect(queue.markSucceeded).toHaveBeenCalledWith(
      baseJob.id,
      "/generated/videos/job.mp4",
    );
    expect(queue.markFailed).not.toHaveBeenCalled();
  });

  it("marks claimed job failed when render throws", async () => {
    const queue = createQueue(baseJob);

    await processNextVideoJob({
      config: {
        workerId: "test-worker",
        pollMs: 1,
        outputDir: "/tmp/videos",
        publicPathPrefix: "/generated/videos",
        once: true,
      },
      queue,
      logger: silentLogger,
      render: vi.fn().mockRejectedValue(new Error("Render failed")),
    });

    expect(queue.markFailed).toHaveBeenCalledWith(baseJob.id, "Render failed");
  });
});

describe("toErrorMessage", () => {
  it("normalizes non-error throws", () => {
    expect(toErrorMessage("boom")).toBe("boom");
  });
});
