import type { SocialMediaKind, SocialPost } from "@mr/db";

export type ResolvedMedia = {
  url: string;
  kind: SocialMediaKind;
};

const PRIVATE_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

// The provider fetches media by URL, so it must be publicly reachable. Guard
// against the common local-dev mistake of pointing at MinIO on localhost.
export function assertPublicUrl(url: string) {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    throw new Error(`Media URL is not a valid URL: ${url}`);
  }

  if (PRIVATE_HOSTS.has(host)) {
    throw new Error(
      `Media URL host "${host}" is not publicly reachable. Use a public ` +
        `domain or expose storage via a tunnel and set S3_PUBLIC_BASE_URL.`,
    );
  }
}

function toPublicUrl(pathOrUrl: string, publicBaseUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = publicBaseUrl.replace(/\/$/, "");
  const path = pathOrUrl.replace(/^\//, "");
  return `${base}/${path}`;
}

// Resolves the public media URL for a publication: a direct mediaUrl when set,
// otherwise the referenced render job's output.
export function resolveMedia(
  post: SocialPost,
  videoOutputPath: string | null,
  publicBaseUrl: string,
): ResolvedMedia {
  let url: string;
  if (post.mediaUrl) {
    url = post.mediaUrl;
  } else if (videoOutputPath) {
    url = toPublicUrl(videoOutputPath, publicBaseUrl);
  } else {
    throw new Error("Publication has no media source (mediaUrl or videoJob).");
  }

  assertPublicUrl(url);
  return { url, kind: post.mediaKind };
}
