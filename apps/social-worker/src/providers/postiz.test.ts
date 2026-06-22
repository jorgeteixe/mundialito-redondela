import { describe, expect, it, vi } from "vitest";
import type { SocialPost, SocialPostTarget } from "@mr/db";
import type { PostizConfig } from "../config";
import type { ResolvedMedia } from "../media";
import {
  createPostizProvider,
  fetchPostizPermalinks,
  PostizApiError,
  type FetchImpl,
} from "./postiz";
import type { PublishContext, SocialWorkerLogger } from "./types";

const postiz: PostizConfig = {
  apiUrl: "https://api.postiz.com/public/v1",
  apiKey: "postiz-key",
  integrationIds: { instagram: "ig-int", facebook: "fb-int" },
};

const logger: SocialWorkerLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

function jsonResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    text: () => Promise.resolve(JSON.stringify(data)),
  } as unknown as Response;
}

function textResponse(body: string, ok = false, status = 400): Response {
  return {
    ok,
    status,
    text: () => Promise.resolve(body),
  } as unknown as Response;
}

function mediaResponse(contentType: string | null = "image/png"): Response {
  return {
    ok: true,
    status: 200,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    headers: {
      get: (key: string) => (key === "content-type" ? contentType : null),
    },
  } as unknown as Response;
}

type RecordedCall = {
  url: string;
  method: string;
  body: unknown;
  headers: Record<string, string> | null;
};

function sequencedFetch(responses: Response[]) {
  const calls: RecordedCall[] = [];
  let index = 0;
  const fetchImpl: FetchImpl = (input, init) => {
    const url = String(input);
    let body: unknown = null;
    if (typeof init?.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = init.body;
      }
    } else if (init?.body instanceof FormData) {
      body = "[FormData]";
    }
    const headers =
      init?.headers && !(init.headers instanceof Headers)
        ? (init.headers as Record<string, string>)
        : null;
    calls.push({ url, method: init?.method ?? "GET", body, headers });
    const response = responses[index] ?? jsonResponse({});
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

type PostizPostBody = {
  type: string;
  posts: {
    integration: { id: string };
    value: { content: string; image: { id: string; path: string }[] }[];
    settings: Record<string, unknown>;
  }[];
};

function firstPost(call: RecordedCall) {
  const body = call.body as PostizPostBody;
  const post = body.posts[0];
  if (!post) throw new Error("Request body had no posts.");
  return post;
}

function makeTarget(platform: SocialPostTarget["platform"]): SocialPostTarget {
  return {
    id: "target-1",
    postId: "post-1",
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

function makeCtx(config: PostizConfig = postiz): {
  ctx: PublishContext;
  setContainerId: ReturnType<typeof vi.fn>;
} {
  const setContainerId = vi.fn().mockResolvedValue(null);
  return { ctx: { postiz: config, logger, setContainerId }, setContainerId };
}

function input(
  platform: SocialPostTarget["platform"],
  post: SocialPost,
  media: ResolvedMedia,
) {
  return { target: makeTarget(platform), post, media };
}

const image: ResolvedMedia = {
  url: "https://media.example.com/a.png",
  kind: "image",
};

describe("createPostizProvider — instagram", () => {
  it("uploads media and posts a feed image with post_type post", async () => {
    const { fetchImpl, call } = sequencedFetch([
      mediaResponse("image/png"),
      jsonResponse({ id: "img-1", path: "https://uploads.postiz.com/a.png" }),
      jsonResponse([{ id: "postiz-post-1", releaseURL: "https://insta/p/1" }]),
    ]);
    const { ctx, setContainerId } = makeCtx();
    const provider = createPostizProvider({ fetchImpl });

    const result = await provider.publish(
      input(
        "instagram",
        makePost({ postType: "feed", mediaKind: "image" }),
        image,
      ),
      ctx,
    );

    expect(result).toEqual({
      providerPostId: "postiz-post-1",
      permalink: "https://insta/p/1",
    });
    expect(setContainerId).toHaveBeenCalledWith("img-1");

    // 0: download media, 1: upload, 2: create post
    expect(call(0).url).toBe("https://media.example.com/a.png");
    expect(call(1).url).toBe("https://api.postiz.com/public/v1/upload");
    expect(call(1).headers).toMatchObject({ Authorization: "postiz-key" });

    expect(firstPost(call(2))).toMatchObject({
      integration: { id: "ig-int" },
      value: [
        {
          content: "Hola",
          image: [{ id: "img-1", path: "https://uploads.postiz.com/a.png" }],
        },
      ],
      settings: { __type: "instagram", post_type: "post" },
    });
    expect(call(2).body).toMatchObject({ type: "now" });
  });

  it("sets post_type story for stories", async () => {
    const { fetchImpl, call } = sequencedFetch([
      mediaResponse("image/png"),
      jsonResponse({ id: "img-2", path: "https://uploads.postiz.com/s.png" }),
      jsonResponse([{ id: "postiz-post-2" }]),
    ]);
    const { ctx } = makeCtx();
    const provider = createPostizProvider({ fetchImpl });

    await provider.publish(
      input(
        "instagram",
        makePost({ postType: "story", mediaKind: "image" }),
        image,
      ),
      ctx,
    );

    expect(firstPost(call(2)).settings).toMatchObject({
      __type: "instagram",
      post_type: "story",
    });
  });

  it("sets post_type reel for reels", async () => {
    const { fetchImpl, call } = sequencedFetch([
      mediaResponse("video/mp4"),
      jsonResponse({ id: "vid-1", path: "https://uploads.postiz.com/a.mp4" }),
      jsonResponse([{ id: "postiz-post-3" }]),
    ]);
    const { ctx } = makeCtx();
    const provider = createPostizProvider({ fetchImpl });

    await provider.publish(
      input("instagram", makePost({ postType: "reel", mediaKind: "video" }), {
        url: "https://media.example.com/a.mp4",
        kind: "video",
      }),
      ctx,
    );

    expect(firstPost(call(2)).settings).toMatchObject({ post_type: "reel" });
  });
});

describe("createPostizProvider — facebook", () => {
  it("omits post_type for feed posts", async () => {
    const { fetchImpl, call } = sequencedFetch([
      mediaResponse("image/png"),
      jsonResponse({ id: "img-3", path: "https://uploads.postiz.com/f.png" }),
      jsonResponse([{ id: "postiz-post-4" }]),
    ]);
    const { ctx } = makeCtx();
    const provider = createPostizProvider({ fetchImpl });

    await provider.publish(
      input(
        "facebook",
        makePost({ postType: "feed", mediaKind: "image" }),
        image,
      ),
      ctx,
    );

    const post = firstPost(call(2));
    expect(post.settings).toMatchObject({ __type: "facebook" });
    expect(post.settings.post_type).toBeUndefined();
    expect(post.integration).toMatchObject({ id: "fb-int" });
  });

  it("sets post_type story for facebook stories", async () => {
    const { fetchImpl, call } = sequencedFetch([
      mediaResponse("video/mp4"),
      jsonResponse({ id: "vid-2", path: "https://uploads.postiz.com/s.mp4" }),
      jsonResponse([{ id: "postiz-post-5" }]),
    ]);
    const { ctx } = makeCtx();
    const provider = createPostizProvider({ fetchImpl });

    await provider.publish(
      input("facebook", makePost({ postType: "story", mediaKind: "video" }), {
        url: "https://media.example.com/s.mp4",
        kind: "video",
      }),
      ctx,
    );

    expect(firstPost(call(2)).settings).toMatchObject({
      __type: "facebook",
      post_type: "story",
    });
  });
});

describe("createPostizProvider — integration resolution", () => {
  it("resolves the integration id from GET /integrations when not overridden", async () => {
    const { fetchImpl, call } = sequencedFetch([
      jsonResponse([
        { id: "auto-ig", identifier: "instagram", disabled: false },
        { id: "auto-fb", identifier: "facebook", disabled: false },
      ]),
      mediaResponse("image/png"),
      jsonResponse({ id: "img-4", path: "https://uploads.postiz.com/x.png" }),
      jsonResponse([{ id: "postiz-post-6" }]),
    ]);
    const { ctx } = makeCtx({ ...postiz, integrationIds: {} });
    const provider = createPostizProvider({ fetchImpl });

    await provider.publish(
      input(
        "instagram",
        makePost({ postType: "feed", mediaKind: "image" }),
        image,
      ),
      ctx,
    );

    expect(call(0).url).toBe("https://api.postiz.com/public/v1/integrations");
    expect(firstPost(call(3)).integration).toMatchObject({ id: "auto-ig" });
  });

  it("throws a non-retriable error when no integration matches", async () => {
    const { fetchImpl } = sequencedFetch([jsonResponse([])]);
    const { ctx } = makeCtx({ ...postiz, integrationIds: {} });
    const provider = createPostizProvider({ fetchImpl });

    await expect(
      provider.publish(input("instagram", makePost({}), image), ctx),
    ).rejects.toMatchObject({
      name: "PostizApiError",
      retriable: false,
    } satisfies Partial<PostizApiError>);
  });
});

describe("createPostizProvider — errors", () => {
  it("marks 4xx responses non-retriable and redacts the api key", async () => {
    const { fetchImpl } = sequencedFetch([
      mediaResponse("image/png"),
      jsonResponse({ id: "img-5", path: "https://uploads.postiz.com/e.png" }),
      textResponse("Unauthorized postiz-key", false, 401),
    ]);
    const { ctx } = makeCtx();
    const provider = createPostizProvider({ fetchImpl });

    await expect(
      provider.publish(input("instagram", makePost({}), image), ctx),
    ).rejects.toMatchObject({
      name: "PostizApiError",
      retriable: false,
      message: expect.stringContaining("[redacted]"),
    } satisfies Partial<PostizApiError>);
  });

  it("marks 5xx responses retriable", async () => {
    const { fetchImpl } = sequencedFetch([
      mediaResponse("image/png"),
      jsonResponse({ id: "img-6", path: "https://uploads.postiz.com/r.png" }),
      textResponse("boom", false, 503),
    ]);
    const { ctx } = makeCtx();
    const provider = createPostizProvider({ fetchImpl });

    await expect(
      provider.publish(input("instagram", makePost({}), image), ctx),
    ).rejects.toMatchObject({
      name: "PostizApiError",
      retriable: true,
    } satisfies Partial<PostizApiError>);
  });
});

describe("fetchPostizPermalinks", () => {
  it("maps released post ids to their releaseURL and skips unreleased ones", async () => {
    const { fetchImpl, call } = sequencedFetch([
      jsonResponse({
        posts: [
          { id: "p1", state: "PUBLISHED", releaseURL: "https://insta/p/1" },
          { id: "p2", state: "QUEUE", releaseURL: null },
          { id: "p3", state: "PUBLISHED", releaseURL: "https://fb/p/3" },
        ],
      }),
    ]);

    const map = await fetchPostizPermalinks(postiz, { fetchImpl });

    expect(call(0).url).toContain("/posts?startDate=");
    expect(call(0).url).toContain("display=all");
    expect(map.get("p1")).toBe("https://insta/p/1");
    expect(map.get("p3")).toBe("https://fb/p/3");
    expect(map.has("p2")).toBe(false);
  });
});
