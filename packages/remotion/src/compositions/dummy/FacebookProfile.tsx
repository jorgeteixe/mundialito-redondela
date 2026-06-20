import { SocialProfile } from "./SocialProfile";
import type { SocialProps } from "./schema";

export function FacebookProfile({ variant }: SocialProps) {
  return <SocialProfile variant={variant} />;
}
