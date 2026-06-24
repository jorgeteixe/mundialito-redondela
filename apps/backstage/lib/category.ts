export type Category = "senior" | "cadet";

export const CATEGORIES: Category[] = ["senior", "cadet"];
export const DEFAULT_CATEGORY: Category = "senior";

export function isCategory(value: string): value is Category {
  return value === "senior" || value === "cadet";
}
