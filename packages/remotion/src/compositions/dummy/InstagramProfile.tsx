import { SocialProfile } from "./SocialProfile";
import type { SocialProps } from "./schema";

export function InstagramProfile({ variant }: SocialProps) {
  return <SocialProfile variant={variant} />;
}
