import { describe, expect, it, vi } from "vitest";
import type { SocialPost, SocialPostTarget } from "@mr/db";
import type { MetaConfig } from "../config";
import type { ResolvedMedia } from "../media";
import { createMetaProvider, type FetchImpl } from "./meta";
import type { PublishContext, SocialWorkerLogger } from "./types";

const meta: MetaConfig = {
  apiVersion: "v21.0",
  igUserId: "ig-1",
  pageId: "page-1",
  pageAccessToken: "token-abc",
  containerPollMs: 0,
  containerPollMaxAttempts: 3,
};

const logger: SocialWorkerLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

function makeResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
  } as unknown as Response;
}

// fetch mock that returns a queued response per call and records the calls.
function sequencedFetch(responses: Response[]) {
  const calls: { url: string; body: Record<string, string> | null }[] = [];
  let index = 0;
  const fetchImpl: FetchImpl = (input, init) => {
    const url = String(input);
    const body =
      init?.body instanceof URLSearchParams
        ? Object.fromEntries(init.body.entries())
        : null;
    calls.push({ url, body });
    const response = responses[index] ?? makeResponse({});
    index += 1;
    return Promise.resolve(response);
  };
  const call = (i: number) => {
    const entry = calls[i];
    if (!entry) throw new Error(`No fetch call at index ${i.toString()}`);
    return entry;
  };
  return { fetchImpl, call };
}

function makeTarget(platform: SocialPostTarget["platform"]): SocialPostTarget {
  return {
    id: "target-1",
    postId: "post-1",
    provider: "meta",
    platform,
    status: "publishing",
    scheduledAt: new Date(),
    attempts: 1,
    maxAttempts: 3,
    lockedAt: null,
    lockedBy: null,
    providerContainerId: null,
    providerPostId: null,
    providerPermalink: null,
    errorMessage: null,
    startedAt: null,
    finishedAt: null,
    failedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makePost(overrides: Partial<SocialPost>): SocialPost {
  return {
    id: "post-1",
    postType: "feed",
    mediaKind: "image",
    caption: "Hola",
    videoJobId: null,
    mediaUrl: null,
    scheduledAt: new Date(),
    createdByUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeCtx(): {
  ctx: PublishContext;
  setContainerId: ReturnType<typeof vi.fn>;
} {
  const setContainerId = vi.fn().mockResolvedValue(null);
  return { ctx: { meta, logger, setContainerId }, setContainerId };
}

function input(
  platform: SocialPostTarget["platform"],
  post: SocialPost,
  media: ResolvedMedia,
) {
  return { target: makeTarget(platform), post, media };
}

describe("createMetaProvider — instagram", () => {
  it("publishes a feed image in two steps without media_type", async () => {
    const { fetchImpl, call } = sequencedFetch([
      makeResponse({ id: "container-1" }),
      makeResponse({ id: "ig-media-1" }),
      makeResponse({ permalink: "https://www.instagram.com/p/ABC/" }),
    ]);
    const { ctx, setContainerId } = makeCtx();
    const provider = createMetaProvider({ fetchImpl });

    const result = await provider.publish(
      input("instagram", makePost({ postType: "feed", mediaKind: "image" }), {
        url: "https://media.example.com/a.png",
        kind: "image",
      }),
      ctx,
    );

    expect(result).toEqual({
      providerPostId: "ig-media-1",
      permalink: "https://www.instagram.com/p/ABC/",
    });
    expect(call(2).url).toContain("/v21.0/ig-media-1?");
    expect(call(2).url).toContain("fields=permalink");
    expect(setContainerId).toHaveBeenCalledWith("container-1");
    expect(call(0).url).toContain("/v21.0/ig-1/media");
    expect(call(0).body).toMatchObject({
      image_url: "https://media.example.com/a.png",
      caption: "Hola",
      access_token: "token-abc",
    });
    expect(call(0).body?.media_type).toBeUndefined();
    expect(call(1).url).toContain("/ig-1/media_publish");
    expect(call(1).body).toMatchObject({ creation_id: "container-1" });
  });

  it("publishes a reel with media_type REELS and polls the container", async () => {
    const { fetchImpl, call } = sequencedFetch([
      makeResponse({ id: "container-2" }),
      makeResponse({ status_code: "IN_PROGRESS" }),
      makeResponse({ status_code: "FINISHED" }),
      makeResponse({ id: "ig-media-2" }),
    ]);
    const { ctx } = makeCtx();
    const provider = createMetaProvider({ fetchImpl });

    const result = await provider.publish(
      input("instagram", makePost({ postType: "reel", mediaKind: "video" }), {
        url: "https://media.example.com/a.mp4",
        kind: "video",
      }),
      ctx,
    );

    expect(result).toMatchObject({ providerPostId: "ig-media-2" });
    expect(call(0).body).toMatchObject({
      video_url: "https://media.example.com/a.mp4",
      media_type: "REELS",
    });
    // Two status polls then publish.
    expect(call(1).url).toContain("/v21.0/container-2");
    expect(call(2).url).toContain("/v21.0/container-2");
    expect(call(3).url).toContain("/ig-1/media_publish");
  });

  it("uses media_type STORIES for stories", async () => {
    const { fetchImpl, call } = sequencedFetch([
      makeResponse({ id: "container-3" }),
      makeResponse({ id: "ig-media-3" }),
    ]);
    const { ctx } = makeCtx();
    const provider = createMetaProvider({ fetchImpl });

    await provider.publish(
      input("instagram", makePost({ postType: "story", mediaKind: "image" }), {
        url: "https://media.example.com/s.png",
        kind: "image",
      }),
      ctx,
    );

    expect(call(0).body).toMatchObject({ media_type: "STORIES" });
  });

  it("throws when the container errors", async () => {
    const { fetchImpl } = sequencedFetch([
      makeResponse({ id: "container-4" }),
      makeResponse({ status_code: "ERROR" }),
    ]);
    const { ctx } = makeCtx();
    const provider = createMetaProvider({ fetchImpl });

    await expect(
      provider.publish(
        input("instagram", makePost({ postType: "reel", mediaKind: "video" }), {
          url: "https://media.example.com/a.mp4",
          kind: "video",
        }),
        ctx,
      ),
    ).rejects.toThrow(/container ERROR/);
  });
});

describe("createMetaProvider — facebook", () => {
  it("posts an image to /photos", async () => {
    const { fetchImpl, call } = sequencedFetch([
      makeResponse({ id: "1", post_id: "page_1_post_1" }),
    ]);
    const { ctx } = makeCtx();
    const provider = createMetaProvider({ fetchImpl });

    const result = await provider.publish(
      input("facebook", makePost({ postType: "feed", mediaKind: "image" }), {
        url: "https://media.example.com/a.png",
        kind: "image",
      }),
      ctx,
    );

    expect(result).toMatchObject({ providerPostId: "page_1_post_1" });
    expect(call(0).url).toContain("/page-1/photos");
    expect(call(0).body).toMatchObject({
      url: "https://media.example.com/a.png",
    });
  });

  it("posts a video to /videos", async () => {
    const { fetchImpl, call } = sequencedFetch([makeResponse({ id: "vid-1" })]);
    const { ctx } = makeCtx();
    const provider = createMetaProvider({ fetchImpl });

    const result = await provider.publish(
      input("facebook", makePost({ postType: "reel", mediaKind: "video" }), {
        url: "https://media.example.com/a.mp4",
        kind: "video",
      }),
      ctx,
    );

    expect(result).toMatchObject({ providerPostId: "vid-1" });
    expect(call(0).url).toContain("/page-1/videos");
    expect(call(0).body).toMatchObject({
      file_url: "https://media.example.com/a.mp4",
    });
  });

  it("rejects facebook stories", async () => {
    const { fetchImpl } = sequencedFetch([]);
    const { ctx } = makeCtx();
    const provider = createMetaProvider({ fetchImpl });

    await expect(
      provider.publish(
        input("facebook", makePost({ postType: "story", mediaKind: "image" }), {
          url: "https://media.example.com/s.png",
          kind: "image",
        }),
        ctx,
      ),
    ).rejects.toThrow(/stories are not supported/i);
  });
});

describe("createMetaProvider — errors", () => {
  it("maps Meta error responses to a readable message", async () => {
    const { fetchImpl } = sequencedFetch([
      makeResponse(
        { error: { message: "Invalid OAuth access token" } },
        false,
        400,
      ),
    ]);
    const { ctx } = makeCtx();
    const provider = createMetaProvider({ fetchImpl });

    await expect(
      provider.publish(
        input("instagram", makePost({ postType: "feed", mediaKind: "image" }), {
          url: "https://media.example.com/a.png",
          kind: "image",
        }),
        ctx,
      ),
    ).rejects.toThrow("Meta API error: Invalid OAuth access token");
  });
});
