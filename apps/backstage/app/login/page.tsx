import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DEFAULT_CATEGORY } from "@/lib/category";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect(`/${DEFAULT_CATEGORY}/teams`);
  return <LoginForm />;
}
