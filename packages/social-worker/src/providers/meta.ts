import type { SocialMediaKind, SocialPostType } from "@mr/db";
import type { MetaConfig } from "../config";
import type {
  PublishContext,
  PublishInput,
  PublishProvider,
  PublishResult,
  SocialWorkerLogger,
} from "./types";

export type FetchImpl = typeof fetch;

type GraphParams = Record<string, string>;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function parseGraphResponse(response: Response) {
  const json = (await response.json().catch(() => null)) as {
    id?: string;
    post_id?: string;
    status_code?: string;
    permalink?: string;
    permalink_url?: string;
    error?: { message?: string };
  } | null;

  if (!response.ok || json?.error) {
    const message =
      json?.error?.message ?? `HTTP ${response.status.toString()}`;
    throw new Error(`Meta API error: ${message}`);
  }
  if (!json) throw new Error("Meta API returned an empty response.");
  return json;
}

async function graphPost(
  fetchImpl: FetchImpl,
  apiVersion: string,
  path: string,
  params: GraphParams,
) {
  const url = `https://graph.facebook.com/${apiVersion}/${path}`;
  const response = await fetchImpl(url, {
    method: "POST",
    body: new URLSearchParams(params),
  });
  return parseGraphResponse(response);
}

async function graphGet(
  fetchImpl: FetchImpl,
  apiVersion: string,
  path: string,
  params: GraphParams,
) {
  const query = new URLSearchParams(params).toString();
  const url = `https://graph.facebook.com/${apiVersion}/${path}?${query}`;
  const response = await fetchImpl(url);
  return parseGraphResponse(response);
}

// Best-effort permalink lookup; never fails the publish if it can't resolve.
async function fetchPermalink(
  fetchImpl: FetchImpl,
  meta: MetaConfig,
  id: string,
  field: "permalink" | "permalink_url",
) {
  try {
    const res = await graphGet(fetchImpl, meta.apiVersion, id, {
      fields: field,
      access_token: meta.pageAccessToken,
    });
    const value = res.permalink ?? res.permalink_url ?? null;
    // Facebook returns relative permalinks (e.g. "/page/posts/123"); make them
    // absolute so the UI doesn't resolve them against its own origin.
    if (value && value.startsWith("/")) {
      return `https://www.facebook.com${value}`;
    }
    return value;
  } catch {
    return null;
  }
}

// Instagram media_type for the create-container step. Feed videos publish as
// reels on Instagram, so a video without a more specific type maps to REELS.
function instagramMediaType(
  postType: SocialPostType,
  mediaKind: SocialMediaKind,
): string | undefined {
  if (postType === "story") return "STORIES";
  if (postType === "reel") return "REELS";
  if (mediaKind === "video") return "REELS";
  return undefined;
}

async function waitForInstagramContainer(
  fetchImpl: FetchImpl,
  meta: MetaConfig,
  creationId: string,
  logger: SocialWorkerLogger,
) {
  for (let attempt = 0; attempt < meta.containerPollMaxAttempts; attempt += 1) {
    const status = await graphGet(fetchImpl, meta.apiVersion, creationId, {
      fields: "status_code",
      access_token: meta.pageAccessToken,
    });

    if (status.status_code === "FINISHED") return;
    if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
      throw new Error(
        `Instagram media container ${status.status_code ?? "unknown"}.`,
      );
    }

    logger.info(
      `[social-worker] ig container ${creationId} ${status.status_code ?? "PENDING"}; waiting`,
    );
    await sleep(meta.containerPollMs);
  }

  throw new Error("Instagram media container did not finish in time.");
}

async function publishInstagram(
  input: PublishInput,
  ctx: PublishContext,
  fetchImpl: FetchImpl,
): Promise<PublishResult> {
  const { meta } = ctx;
  const createParams: GraphParams = {
    access_token: meta.pageAccessToken,
    caption: input.post.caption,
  };

  const mediaType = instagramMediaType(input.post.postType, input.media.kind);
  if (mediaType) createParams.media_type = mediaType;
  if (input.media.kind === "video") createParams.video_url = input.media.url;
  else createParams.image_url = input.media.url;

  const created = await graphPost(
    fetchImpl,
    meta.apiVersion,
    `${meta.igUserId}/media`,
    createParams,
  );
  const creationId = created.id;
  if (!creationId) throw new Error("Instagram did not return a creation id.");
  await ctx.setContainerId(creationId);

  // Video containers process asynchronously; images are ready immediately.
  if (input.media.kind === "video") {
    await waitForInstagramContainer(fetchImpl, meta, creationId, ctx.logger);
  }

  const published = await graphPost(
    fetchImpl,
    meta.apiVersion,
    `${meta.igUserId}/media_publish`,
    { access_token: meta.pageAccessToken, creation_id: creationId },
  );
  if (!published.id) throw new Error("Instagram did not return a media id.");
  const permalink = await fetchPermalink(
    fetchImpl,
    meta,
    published.id,
    "permalink",
  );
  return { providerPostId: published.id, permalink };
}

async function publishFacebook(
  input: PublishInput,
  ctx: PublishContext,
  fetchImpl: FetchImpl,
): Promise<PublishResult> {
  const { meta } = ctx;

  if (input.post.postType === "story") {
    throw new Error(
      "Facebook stories are not supported via the Graph API in this worker.",
    );
  }

  if (input.media.kind === "video") {
    const res = await graphPost(
      fetchImpl,
      meta.apiVersion,
      `${meta.pageId}/videos`,
      {
        access_token: meta.pageAccessToken,
        file_url: input.media.url,
        description: input.post.caption,
      },
    );
    if (!res.id) throw new Error("Facebook did not return a video id.");
    const permalink = await fetchPermalink(
      fetchImpl,
      meta,
      res.id,
      "permalink_url",
    );
    return { providerPostId: res.id, permalink };
  }

  const res = await graphPost(
    fetchImpl,
    meta.apiVersion,
    `${meta.pageId}/photos`,
    {
      access_token: meta.pageAccessToken,
      url: input.media.url,
      caption: input.post.caption,
    },
  );
  const id = res.post_id ?? res.id;
  if (!id) throw new Error("Facebook did not return a photo id.");
  const permalink = await fetchPermalink(fetchImpl, meta, id, "permalink_url");
  return { providerPostId: id, permalink };
}

export function createMetaProvider(
  options: { fetchImpl?: FetchImpl } = {},
): PublishProvider {
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    publish(input, ctx) {
      switch (input.target.platform) {
        case "instagram":
          return publishInstagram(input, ctx, fetchImpl);
        case "facebook":
          return publishFacebook(input, ctx, fetchImpl);
        default:
          throw new Error(`Unsupported platform: ${input.target.platform}`);
      }
    },
  };
}
