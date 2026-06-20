import type { SocialProvider } from "@mr/db";
import { createMetaProvider } from "./meta";
import type { PublishProvider } from "./types";

export type ProviderRegistry = Record<SocialProvider, PublishProvider>;

// Register additional providers here as the platform grows.
export function createProviderRegistry(): ProviderRegistry {
  return {
    meta: createMetaProvider(),
  };
}

export * from "./types";
