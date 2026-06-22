import type { SocialPost, SocialPostTarget } from "@mr/db";
import type { PostizConfig } from "../config";
import type { ResolvedMedia } from "../media";

export type SocialWorkerLogger = {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
};

export type PublishInput = {
  target: SocialPostTarget;
  post: SocialPost;
  media: ResolvedMedia;
};

export type PublishContext = {
  // Provider config is supplied per the registered providers; each provider
  // validates that its own config is present before publishing.
  postiz?: PostizConfig;
  logger: SocialWorkerLogger;
  // Persists an intermediate provider container id (e.g. IG creation_id) so the
  // state is observable mid-flight.
  setContainerId: (containerId: string) => Promise<unknown>;
};

export type PublishResult = {
  providerPostId: string;
  /** Public permalink to the published post, when the provider can resolve one. */
  permalink?: string | null;
};

// The extensibility seam: add a new provider (Buffer, TikTok, ...) by
// implementing this and registering it in providers/index.ts.
export interface PublishProvider {
  publish(input: PublishInput, ctx: PublishContext): Promise<PublishResult>;
}
