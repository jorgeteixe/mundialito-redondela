import { redirect } from "next/navigation";
import { DEFAULT_CATEGORY } from "@/lib/category";

export default function RootPage() {
  redirect(`/${DEFAULT_CATEGORY}/teams`);
}
