const DICEBEAR_VERSION = "10.x";

function seed(value: string) {
  return encodeURIComponent(value);
}

export function teamAvatarUrl(id: string) {
  return `https://api.dicebear.com/${DICEBEAR_VERSION}/shapes/svg?seed=${seed(id)}`;
}

export function playerAvatarUrl(id: string) {
  return `https://api.dicebear.com/${DICEBEAR_VERSION}/lorelei/svg?seed=${seed(id)}`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function categoryLabel(category: "senior" | "cadet") {
  return category === "senior" ? "Senior" : "Cadete";
}
