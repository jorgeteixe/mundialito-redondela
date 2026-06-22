import { describe, expect, it, vi } from "vitest";
import type {
  SocialPost,
  SocialPostMediaContext,
  SocialPostTarget,
} from "@mr/db";
import type { SocialWorkerConfig } from "./config";
import {
  processNextSocialPost,
  reconcileSocialPermalinks,
  type SocialJobQueue,
} from "./worker";
import type { PublishProvider, SocialWorkerLogger } from "./providers/types";

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
  postiz: {
    apiUrl: "https://api.postiz.com/public/v1",
    apiKey: "postiz-key",
    integrationIds: {},
  },
};

const baseTarget: SocialPostTarget = {
  id: "target-1",
  postId: "post-1",
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
    listAwaitingPermalink: vi.fn().mockResolvedValue([]),
    setPermalink: vi.fn().mockResolvedValue(null),
  };
}

function createProvider(publish = vi.fn()): PublishProvider {
  return { publish };
}

describe("processNextSocialPost", () => {
  it("returns false when no target is due", async () => {
    const queue = createQueue(null);
    const provider = createProvider();

    await expect(
      processNextSocialPost({
        config: testConfig,
        queue,
        provider,
        logger: silentLogger,
      }),
    ).resolves.toBe(false);

    expect(provider.publish).not.toHaveBeenCalled();
    expect(queue.markPublished).not.toHaveBeenCalled();
  });

  it("publishes a claimed target and marks it published", async () => {
    const queue = createQueue(baseTarget);
    const publish = vi.fn().mockResolvedValue({ providerPostId: "postiz-99" });
    const provider = createProvider(publish);

    await expect(
      processNextSocialPost({
        config: testConfig,
        queue,
        provider,
        logger: silentLogger,
      }),
    ).resolves.toBe(true);

    expect(publish).toHaveBeenCalledWith(
      expect.objectContaining({
        target: baseTarget,
        post: basePost,
        media: { url: "https://media.example.com/post-1.png", kind: "image" },
      }),
      expect.objectContaining({ postiz: testConfig.postiz }),
    );
    expect(queue.markPublished).toHaveBeenCalledWith(
      "target-1",
      "postiz-99",
      undefined,
    );
    expect(queue.markFailed).not.toHaveBeenCalled();
  });

  it("marks failed when the provider throws", async () => {
    const queue = createQueue(baseTarget);
    const provider = createProvider(
      vi.fn().mockRejectedValue(new Error("Postiz API error: bad key")),
    );

    await processNextSocialPost({
      config: testConfig,
      queue,
      provider,
      logger: silentLogger,
    });

    expect(queue.markFailed).toHaveBeenCalledWith(
      "target-1",
      "Postiz API error: bad key",
    );
    expect(queue.markPublished).not.toHaveBeenCalled();
  });

  it("marks failed without retry when the provider error is non-retriable", async () => {
    const queue = createQueue(baseTarget);
    const error = new Error("Postiz API error: unauthorized") as Error & {
      retriable: boolean;
    };
    error.retriable = false;
    const provider = createProvider(vi.fn().mockRejectedValue(error));

    await processNextSocialPost({
      config: testConfig,
      queue,
      provider,
      logger: silentLogger,
    });

    expect(queue.markFailed).toHaveBeenCalledWith(
      "target-1",
      "Postiz API error: unauthorized",
      { retryable: false },
    );
    expect(queue.markPublished).not.toHaveBeenCalled();
  });

  it("fails fast when media resolves to a localhost URL", async () => {
    const queue = createQueue(baseTarget, {
      post: { ...basePost, mediaUrl: "http://localhost:9000/x.png" },
      videoOutputPath: null,
    });
    const provider = createProvider();

    await processNextSocialPost({
      config: testConfig,
      queue,
      provider,
      logger: silentLogger,
    });

    expect(provider.publish).not.toHaveBeenCalled();
    expect(queue.markFailed).toHaveBeenCalledWith(
      "target-1",
      expect.stringContaining("not publicly reachable"),
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
    const provider = createProvider(publish);

    await processNextSocialPost({
      config: testConfig,
      queue,
      provider,
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

describe("reconcileSocialPermalinks", () => {
  it("backfills permalinks for published targets once Postiz releases them", async () => {
    const queue = createQueue(null);
    queue.listAwaitingPermalink = vi.fn().mockResolvedValue([
      { ...baseTarget, id: "t-1", providerPostId: "p1" },
      { ...baseTarget, id: "t-2", providerPostId: "p2" },
    ]);
    const resolvePermalinks = vi
      .fn()
      .mockResolvedValue(new Map([["p1", "https://insta/p/1"]]));

    const updated = await reconcileSocialPermalinks({
      config: testConfig,
      queue,
      logger: silentLogger,
      resolvePermalinks,
    });

    expect(resolvePermalinks).toHaveBeenCalledWith(testConfig.postiz);
    expect(queue.setPermalink).toHaveBeenCalledTimes(1);
    expect(queue.setPermalink).toHaveBeenCalledWith("t-1", "https://insta/p/1");
    expect(updated).toBe(1);
  });

  it("does nothing when no targets await a permalink", async () => {
    const queue = createQueue(null);
    const resolvePermalinks = vi.fn();

    const updated = await reconcileSocialPermalinks({
      config: testConfig,
      queue,
      logger: silentLogger,
      resolvePermalinks,
    });

    expect(resolvePermalinks).not.toHaveBeenCalled();
    expect(queue.setPermalink).not.toHaveBeenCalled();
    expect(updated).toBe(0);
  });
});
