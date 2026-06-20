import { describe, expect, it, vi } from "vitest";
import type {
  SocialPost,
  SocialPostMediaContext,
  SocialPostTarget,
} from "@mr/db";
import type { SocialWorkerConfig } from "./config";
import { processNextSocialPost, type SocialJobQueue } from "./worker";
import type { ProviderRegistry } from "./providers";
import type { SocialWorkerLogger } from "./providers/types";

const silentLogger: SocialWorkerLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

const testConfig: SocialWorkerConfig = {
  workerId: "test-worker",
  pollMs: 1,
  once: true,
  s3PublicBaseUrl: "https://media.example.com",
  meta: {
    apiVersion: "v21.0",
    igUserId: "ig-1",
    pageId: "page-1",
    pageAccessToken: "token",
    containerPollMs: 0,
    containerPollMaxAttempts: 3,
  },
};

const baseTarget: SocialPostTarget = {
  id: "target-1",
  postId: "post-1",
  provider: "meta",
  platform: "instagram",
  status: "publishing",
  scheduledAt: new Date(),
  attempts: 1,
  maxAttempts: 3,
  lockedAt: new Date(),
  lockedBy: "test-worker",
  providerContainerId: null,
  providerPostId: null,
  providerPermalink: null,
  errorMessage: null,
  startedAt: new Date(),
  finishedAt: null,
  failedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const basePost: SocialPost = {
  id: "post-1",
  postType: "feed",
  mediaKind: "image",
  caption: "Hola Mundialito",
  videoJobId: null,
  mediaUrl: "https://media.example.com/post-1.png",
  scheduledAt: new Date(),
  createdByUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createQueue(
  target: SocialPostTarget | null,
  context: SocialPostMediaContext | null = {
    post: basePost,
    videoOutputPath: null,
  },
): SocialJobQueue {
  return {
    claimNext: vi.fn().mockResolvedValue(target),
    loadMediaContext: vi.fn().mockResolvedValue(context),
    setContainerId: vi.fn().mockResolvedValue(null),
    markPublished: vi.fn().mockResolvedValue(null),
    markFailed: vi.fn().mockResolvedValue(null),
  };
}

function createRegistry(publish = vi.fn()): ProviderRegistry {
  return { meta: { publish } };
}

describe("processNextSocialPost", () => {
  it("returns false when no target is due", async () => {
    const queue = createQueue(null);
    const registry = createRegistry();

    await expect(
      processNextSocialPost({
        config: testConfig,
        queue,
        providers: registry,
        logger: silentLogger,
      }),
    ).resolves.toBe(false);

    expect(registry.meta.publish).not.toHaveBeenCalled();
    expect(queue.markPublished).not.toHaveBeenCalled();
  });

  it("publishes a claimed target and marks it published", async () => {
    const queue = createQueue(baseTarget);
    const publish = vi
      .fn()
      .mockResolvedValue({ providerPostId: "ig-media-99" });
    const registry = createRegistry(publish);

    await expect(
      processNextSocialPost({
        config: testConfig,
        queue,
        providers: registry,
        logger: silentLogger,
      }),
    ).resolves.toBe(true);

    expect(publish).toHaveBeenCalledWith(
      expect.objectContaining({
        target: baseTarget,
        post: basePost,
        media: { url: "https://media.example.com/post-1.png", kind: "image" },
      }),
      expect.objectContaining({ meta: testConfig.meta }),
    );
    expect(queue.markPublished).toHaveBeenCalledWith(
      "target-1",
      "ig-media-99",
      undefined,
    );
    expect(queue.markFailed).not.toHaveBeenCalled();
  });

  it("marks failed when the provider throws", async () => {
    const queue = createQueue(baseTarget);
    const registry = createRegistry(
      vi.fn().mockRejectedValue(new Error("Meta API error: bad token")),
    );

    await processNextSocialPost({
      config: testConfig,
      queue,
      providers: registry,
      logger: silentLogger,
    });

    expect(queue.markFailed).toHaveBeenCalledWith(
      "target-1",
      "Meta API error: bad token",
    );
    expect(queue.markPublished).not.toHaveBeenCalled();
  });

  it("fails fast when media resolves to a localhost URL", async () => {
    const queue = createQueue(baseTarget, {
      post: { ...basePost, mediaUrl: "http://localhost:9000/x.png" },
      videoOutputPath: null,
    });
    const registry = createRegistry();

    await processNextSocialPost({
      config: testConfig,
      queue,
      providers: registry,
      logger: silentLogger,
    });

    expect(registry.meta.publish).not.toHaveBeenCalled();
    expect(queue.markFailed).toHaveBeenCalledWith(
      "target-1",
      expect.stringContaining("not reachable by Meta"),
    );
  });

  it("builds a public URL from a render job output", async () => {
    const queue = createQueue(
      { ...baseTarget, platform: "facebook" },
      {
        post: {
          ...basePost,
          mediaUrl: null,
          videoJobId: "job-1",
          mediaKind: "video",
        },
        videoOutputPath: "https://media.example.com/videos/job-1.mp4",
      },
    );
    const publish = vi.fn().mockResolvedValue({ providerPostId: "fb-1" });
    const registry = createRegistry(publish);

    await processNextSocialPost({
      config: testConfig,
      queue,
      providers: registry,
      logger: silentLogger,
    });

    expect(publish).toHaveBeenCalledWith(
      expect.objectContaining({
        media: {
          url: "https://media.example.com/videos/job-1.mp4",
          kind: "video",
        },
      }),
      expect.anything(),
    );
  });
});
