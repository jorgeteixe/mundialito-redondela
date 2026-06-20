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

type GraphResponse = {
  id?: string;
  post_id?: string;
  video_id?: string;
  upload_url?: string;
  status_code?: string;
  permalink?: string;
  permalink_url?: string;
  error?: { message?: string };
};

function sanitizeMetaDetails(value: string) {
  return value
    .replaceAll(/access_token=([^&\s"]+)/g, "access_token=[redacted]")
    .replaceAll(/"access_token"\s*:\s*"[^"]+"/g, '"access_token":"[redacted]"');
}

async function readGraphResponseBody(response: Response) {
  const jsonResponse =
    typeof response.clone === "function" ? response.clone() : response;
  const json = (await jsonResponse
    .json()
    .catch(() => null)) as GraphResponse | null;
  if (json) {
    return { json, details: sanitizeMetaDetails(JSON.stringify(json)) };
  }

  const text = await response
    .text()
    .then((value) => value.trim())
    .catch(() => "");
  return {
    json: null,
    details: text ? sanitizeMetaDetails(text) : null,
  };
}

async function parseGraphResponse(
  response: Response,
  operation: string,
): Promise<GraphResponse> {
  const { json, details } = await readGraphResponseBody(response);

  if (!response.ok || json?.error) {
    const message =
      json?.error?.message ??
      `HTTP ${response.status.toString()}${details ? ` body=${details}` : ""}`;
    throw new Error(`Meta API error at ${operation}: ${message}`);
  }
  if (!json) {
    throw new Error(`Meta API error at ${operation}: empty response`);
  }
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
  return parseGraphResponse(response, `POST /${path}`);
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
  return parseGraphResponse(response, `GET /${path}`);
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
    if (input.media.kind === "video") {
      return publishFacebookVideoStory(input, ctx, fetchImpl);
    }

    return publishFacebookPhotoStory(input, ctx, fetchImpl);
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

async function publishFacebookPhotoStory(
  input: PublishInput,
  ctx: PublishContext,
  fetchImpl: FetchImpl,
): Promise<PublishResult> {
  const { meta } = ctx;
  ctx.logger.info(
    `[social-worker] facebook story target=${input.target.id} step=upload-photo endpoint=/${meta.pageId}/photos`,
  );
  const uploaded = await graphPost(
    fetchImpl,
    meta.apiVersion,
    `${meta.pageId}/photos`,
    {
      access_token: meta.pageAccessToken,
      url: input.media.url,
      published: "false",
    },
  );
  const photoId = uploaded.id;
  if (!photoId) throw new Error("Facebook did not return a photo id.");
  await ctx.setContainerId(photoId);

  ctx.logger.info(
    `[social-worker] facebook story target=${input.target.id} step=publish-photo endpoint=/${meta.pageId}/photo_stories container=${photoId}`,
  );
  const published = await graphPost(
    fetchImpl,
    meta.apiVersion,
    `${meta.pageId}/photo_stories`,
    {
      access_token: meta.pageAccessToken,
      photo_id: photoId,
    },
  );
  const id = published.post_id ?? published.id;
  if (!id) throw new Error("Facebook did not return a story post id.");
  const permalink = await fetchPermalink(fetchImpl, meta, id, "permalink_url");
  return { providerPostId: id, permalink };
}

async function publishFacebookVideoStory(
  input: PublishInput,
  ctx: PublishContext,
  fetchImpl: FetchImpl,
): Promise<PublishResult> {
  const { meta } = ctx;
  ctx.logger.info(
    `[social-worker] facebook story target=${input.target.id} step=start-video endpoint=/${meta.pageId}/video_stories`,
  );
  const started = await graphPost(
    fetchImpl,
    meta.apiVersion,
    `${meta.pageId}/video_stories`,
    {
      access_token: meta.pageAccessToken,
      upload_phase: "start",
    },
  );
  const videoId = started.video_id;
  if (!videoId) throw new Error("Facebook did not return a story video id.");
  if (!started.upload_url) {
    throw new Error("Facebook did not return a story video upload URL.");
  }
  await ctx.setContainerId(videoId);

  ctx.logger.info(
    `[social-worker] facebook story target=${input.target.id} step=upload-video container=${videoId}`,
  );
  const uploaded = await fetchImpl(started.upload_url, {
    method: "POST",
    headers: {
      Authorization: `OAuth ${meta.pageAccessToken}`,
      file_url: input.media.url,
    },
  });
  await parseGraphResponse(uploaded, "POST Facebook story video upload URL");

  ctx.logger.info(
    `[social-worker] facebook story target=${input.target.id} step=finish-video endpoint=/${meta.pageId}/video_stories container=${videoId}`,
  );
  const published = await graphPost(
    fetchImpl,
    meta.apiVersion,
    `${meta.pageId}/video_stories`,
    {
      access_token: meta.pageAccessToken,
      upload_phase: "finish",
      video_id: videoId,
    },
  );
  const id = published.post_id ?? published.id;
  if (!id) throw new Error("Facebook did not return a story post id.");
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
