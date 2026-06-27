// Group coloring lives in @mr/ui so the deterministic tint stays identical
// across the group badge, group avatars, and the calendar. Re-exported under
// this name for the existing call sites.
export { groupTint as groupAvatarStyle } from "@mr/ui";
