import { describe, expect, it, vi } from "vitest";
import type { VideoGenerationJob } from "@mr/db";
import {
  processNextVideoJob,
  toErrorMessage,
  type VideoJobQueue,
  type VideoWorkerLogger,
} from "./worker";
import type { VideoWorkerConfig } from "./config";

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

const testConfig: VideoWorkerConfig = {
  workerId: "test-worker",
  pollMs: 1,
  outputDir: "/tmp/videos",
  storage: {
    endpoint: "http://localhost:9000",
    region: "auto",
    bucket: "test-videos",
    accessKeyId: "test",
    secretAccessKey: "test",
    publicBaseUrl: "http://localhost:9000",
    forcePathStyle: true,
    applyPublicReadPolicy: true,
  },
  once: true,
};

describe("processNextVideoJob", () => {
  it("returns false when no queued job exists", async () => {
    const queue = createQueue(null);

    await expect(
      processNextVideoJob({
        config: testConfig,
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
        config: testConfig,
        queue,
        logger: silentLogger,
        render: vi.fn().mockResolvedValue({
          outputLocation: "/tmp/videos/job.mp4",
          publicPath:
            "http://localhost:9000/test-videos/videos/hello-world/job.mp4",
        }),
      }),
    ).resolves.toBe(true);

    expect(queue.markSucceeded).toHaveBeenCalledWith(
      baseJob.id,
      "http://localhost:9000/test-videos/videos/hello-world/job.mp4",
    );
    expect(queue.markFailed).not.toHaveBeenCalled();
  });

  it("renders and succeeds an image job the same way", async () => {
    const imageJob: VideoGenerationJob = {
      ...baseJob,
      templateId: "result-card",
      kind: "image",
      inputProps: {
        homeTeam: "Redondela",
        awayTeam: "A Xunqueira",
        homeScore: 2,
        awayScore: 1,
        category: "Senior",
      },
    };
    const queue = createQueue(imageJob);
    const render = vi.fn().mockResolvedValue({
      outputLocation: "/tmp/videos/job.png",
      publicPath:
        "http://localhost:9000/test-videos/images/result-card/job.png",
    });

    await expect(
      processNextVideoJob({
        config: testConfig,
        queue,
        logger: silentLogger,
        render,
      }),
    ).resolves.toBe(true);

    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({ job: imageJob }),
    );
    expect(queue.markSucceeded).toHaveBeenCalledWith(
      imageJob.id,
      "http://localhost:9000/test-videos/images/result-card/job.png",
    );
  });

  it("marks claimed job failed when render throws", async () => {
    const queue = createQueue(baseJob);

    await processNextVideoJob({
      config: testConfig,
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
