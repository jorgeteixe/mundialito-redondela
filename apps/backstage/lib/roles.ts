export const backstageRoles = ["viewer", "admin", "super-admin"] as const;

export type BackstageRole = (typeof backstageRoles)[number];

export const roleLabels: Record<BackstageRole, string> = {
  viewer: "Solo lectura",
  admin: "Admin",
  "super-admin": "Super admin",
};

export function parseBackstageRole(role: string | null | undefined) {
  return backstageRoles.includes(role as BackstageRole)
    ? (role as BackstageRole)
    : "viewer";
}

export function canWriteBackstage(role: string | null | undefined) {
  const parsed = parseBackstageRole(role);
  return parsed === "admin" || parsed === "super-admin";
}

export function canManageUsers(role: string | null | undefined) {
  return parseBackstageRole(role) === "super-admin";
}
