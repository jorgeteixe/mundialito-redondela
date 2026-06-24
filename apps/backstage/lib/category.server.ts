import "server-only";

import { notFound } from "next/navigation";
import { isCategory } from "./category";
import type { Category } from "./category";

// Validates the [category] route segment, 404ing on anything but senior/cadet.
export function parseCategoryParam(category: string): Category {
  if (!isCategory(category)) notFound();
  return category;
}
