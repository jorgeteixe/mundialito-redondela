import type { SocialPostType } from "@mr/db";
import type { PostizConfig } from "../config";
import type {
  PublishContext,
  PublishInput,
  PublishProvider,
  PublishResult,
} from "./types";

export type FetchImpl = typeof fetch;

// A post whose scheduledAt is more than this far ahead is handed to Postiz's
// scheduler; anything closer publishes immediately.
const SCHEDULE_LEAD_THRESHOLD_MS = 60_000;

// Within the Postiz provider the config is guaranteed present (validated in the
// publish wrapper), so narrow the optional context field once here.
type PostizPublishContext = Omit<PublishContext, "postiz"> & {
  postiz: PostizConfig;
};

type Platform = PublishInput["target"]["platform"];

type PostizIntegration = {
  id: string;
  identifier: string;
  disabled?: boolean;
};

type PostizUpload = { id: string; path: string };

export class PostizApiError extends Error {
  readonly retriable: boolean;

  constructor(message: string, retriable: boolean) {
    super(message);
    this.name = "PostizApiError";
    this.retriable = retriable;
  }
}

// 4xx are caller errors that won't fix themselves on retry (and retrying auth
// failures is exactly what gets accounts flagged); 429 and 5xx are transient.
function retriableFromStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function redact(value: string, secret: string): string {
  if (!secret) return value;
  return value.split(secret).join("[redacted]");
}

function extractErrorMessage(json: unknown): string | undefined {
  if (json && typeof json === "object") {
    const record = json as Record<string, unknown>;
    const message = record.message ?? record.error;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }
  return undefined;
}

async function parsePostizResponse(
  response: Response,
  operation: string,
  secret: string,
): Promise<unknown> {
  const text = await response.text().catch(() => "");
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    const detail =
      extractErrorMessage(json) ??
      `HTTP ${response.status.toString()}${
        text ? ` body=${redact(text, secret)}` : ""
      }`;
    throw new PostizApiError(
      `Postiz API error at ${operation}: ${detail}`,
      retriableFromStatus(response.status),
    );
  }

  return json;
}

function authHeaders(postiz: PostizConfig): Record<string, string> {
  return { Authorization: postiz.apiKey };
}

async function resolveIntegrationId(
  fetchImpl: FetchImpl,
  postiz: PostizConfig,
  platform: Platform,
  cache: { integrations?: PostizIntegration[] },
): Promise<string> {
  const override = postiz.integrationIds[platform];
  if (override) return override;

  if (!cache.integrations) {
    const response = await fetchImpl(`${postiz.apiUrl}/integrations`, {
      headers: authHeaders(postiz),
    });
    const json = await parsePostizResponse(
      response,
      "GET /integrations",
      postiz.apiKey,
    );
    cache.integrations = Array.isArray(json)
      ? (json as PostizIntegration[])
      : [];
  }

  const match = cache.integrations.find(
    (integration) =>
      integration.identifier === platform && !integration.disabled,
  );
  if (!match) {
    throw new PostizApiError(
      `No active Postiz integration for platform "${platform}". ` +
        `Connect the channel in Postiz or set POSTIZ_${platform.toUpperCase()}_INTEGRATION_ID.`,
      false,
    );
  }
  return match.id;
}

function filenameFromUrl(url: string, kind: PublishInput["media"]["kind"]) {
  try {
    const name = new URL(url).pathname.split("/").pop();
    if (name) return name;
  } catch {
    // fall through to a generated name
  }
  return kind === "video" ? "media.mp4" : "media.jpg";
}

// Postiz publishes from media it hosts, so download the public asset and upload
// the bytes to Postiz rather than handing it a URL.
async function uploadMedia(
  fetchImpl: FetchImpl,
  postiz: PostizConfig,
  input: PublishInput,
): Promise<PostizUpload> {
  const download = await fetchImpl(input.media.url);
  if (!download.ok) {
    throw new PostizApiError(
      `Failed to download media ${input.media.url}: HTTP ${download.status.toString()}`,
      retriableFromStatus(download.status),
    );
  }

  const buffer = await download.arrayBuffer();
  const contentType =
    download.headers.get("content-type") ??
    (input.media.kind === "video" ? "video/mp4" : "image/jpeg");

  const form = new FormData();
  form.append(
    "file",
    new Blob([buffer], { type: contentType }),
    filenameFromUrl(input.media.url, input.media.kind),
  );

  const response = await fetchImpl(`${postiz.apiUrl}/upload`, {
    method: "POST",
    headers: authHeaders(postiz),
    body: form,
  });
  const json = (await parsePostizResponse(
    response,
    "POST /upload",
    postiz.apiKey,
  )) as Partial<PostizUpload> | null;

  if (!json?.id || !json.path) {
    throw new PostizApiError(
      "Postiz upload did not return an id and path.",
      false,
    );
  }
  return { id: json.id, path: json.path };
}

// Map our post type to Postiz's per-platform `settings.post_type`.
function buildSettings(
  platform: Platform,
  postType: SocialPostType,
): Record<string, unknown> {
  if (platform === "instagram") {
    const postTypeValue =
      postType === "story" ? "story" : postType === "reel" ? "reel" : "post";
    return { __type: "instagram", post_type: postTypeValue, collaborators: [] };
  }

  // Facebook: only stories carry a post_type; feed posts omit it.
  const settings: Record<string, unknown> = { __type: "facebook" };
  if (postType === "story") settings.post_type = "story";
  return settings;
}

function extractPublishResult(json: unknown): PublishResult {
  const first = Array.isArray(json) ? json[0] : json;
  if (first && typeof first === "object") {
    const record = first as Record<string, unknown>;
    const id = record.postId ?? record.id;
    const permalink = record.releaseURL ?? record.url ?? null;
    if (typeof id === "string") {
      return {
        providerPostId: id,
        permalink: typeof permalink === "string" ? permalink : null,
      };
    }
  }
  throw new PostizApiError("Postiz did not return a post id.", false);
}

async function publish(
  input: PublishInput,
  ctx: PostizPublishContext,
  fetchImpl: FetchImpl,
  cache: { integrations?: PostizIntegration[] },
): Promise<PublishResult> {
  const { postiz } = ctx;
  const platform = input.target.platform;

  const integrationId = await resolveIntegrationId(
    fetchImpl,
    postiz,
    platform,
    cache,
  );

  const media = await uploadMedia(fetchImpl, postiz, input);
  // The uploaded media id is the closest thing to an intermediate container.
  await ctx.setContainerId(media.id);

  // A future scheduledAt is delegated to Postiz's own scheduler (type
  // "schedule"); anything due now publishes immediately (type "now", date
  // ignored). The +5m floor is enforced at creation time.
  const leadMs = input.post.scheduledAt.getTime() - Date.now();
  const scheduled = leadMs > SCHEDULE_LEAD_THRESHOLD_MS;
  const body = {
    type: scheduled ? "schedule" : "now",
    date: scheduled
      ? input.post.scheduledAt.toISOString()
      : new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: [
      {
        integration: { id: integrationId },
        value: [
          {
            content: input.post.caption,
            image: [{ id: media.id, path: media.path }],
          },
        ],
        settings: buildSettings(platform, input.post.postType),
      },
    ],
  };

  ctx.logger.info(
    `[social-worker] postiz publish target=${input.target.id} platform=${platform} integration=${integrationId}`,
  );

  const response = await fetchImpl(`${postiz.apiUrl}/posts`, {
    method: "POST",
    headers: { ...authHeaders(postiz), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await parsePostizResponse(
    response,
    "POST /posts",
    postiz.apiKey,
  );
  return extractPublishResult(json);
}

// Resolve published-post permalinks. Postiz publishes asynchronously, so
// `releaseURL` is only populated once a post leaves QUEUE; the worker polls this
// to backfill permalinks. Returns a map of Postiz post id -> permalink.
export async function fetchPostizPermalinks(
  postiz: PostizConfig,
  options: { fetchImpl?: FetchImpl; sinceMs?: number } = {},
): Promise<Map<string, string>> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = Date.now();
  const startDate = new Date(
    now - (options.sinceMs ?? 7 * 24 * 60 * 60 * 1000),
  ).toISOString();
  const endDate = new Date(now + 24 * 60 * 60 * 1000).toISOString();

  const url = `${postiz.apiUrl}/posts?startDate=${startDate}&endDate=${endDate}&display=all`;
  const response = await fetchImpl(url, { headers: authHeaders(postiz) });
  const json = await parsePostizResponse(response, "GET /posts", postiz.apiKey);

  const posts = (json as { posts?: unknown[] } | null)?.posts;
  const map = new Map<string, string>();
  if (Array.isArray(posts)) {
    for (const post of posts) {
      if (post && typeof post === "object") {
        const record = post as Record<string, unknown>;
        if (
          typeof record.id === "string" &&
          typeof record.releaseURL === "string" &&
          record.releaseURL
        ) {
          map.set(record.id, record.releaseURL);
        }
      }
    }
  }
  return map;
}

export function createPostizProvider(
  options: { fetchImpl?: FetchImpl } = {},
): PublishProvider {
  const fetchImpl = options.fetchImpl ?? fetch;
  // Integration list is stable for a worker's lifetime; resolve once and reuse.
  const cache: { integrations?: PostizIntegration[] } = {};

  return {
    publish(input, ctx) {
      if (!ctx.postiz) {
        throw new Error("Postiz provider requires POSTIZ_API_KEY.");
      }
      const postizCtx: PostizPublishContext = { ...ctx, postiz: ctx.postiz };
      switch (input.target.platform) {
        case "instagram":
        case "facebook":
          return publish(input, postizCtx, fetchImpl, cache);
        default:
          throw new Error(`Unsupported platform: ${input.target.platform}`);
      }
    },
  };
}
