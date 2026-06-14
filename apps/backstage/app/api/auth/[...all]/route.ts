import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;
export async function POST(req: Request) {
  const url = new URL(req.url);
  if (url.pathname === "/api/auth/sign-up/email") {
    return Response.json({ error: "Signup is disabled" }, { status: 403 });
  }
  return handler.POST(req);
}
