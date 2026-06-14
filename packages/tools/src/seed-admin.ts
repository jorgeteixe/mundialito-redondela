import "dotenv/config";
import * as p from "@clack/prompts";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@mr/db";
import * as schema from "@mr/db/schema";

const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "seed-admin-secret",
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
});

p.intro("Seed admin user");

const email = await p.text({ message: "Email" });
if (p.isCancel(email)) process.exit(0);

const password = await p.password({ message: "Password" });
if (p.isCancel(password)) process.exit(0);

const spinner = p.spinner();
spinner.start("Creating admin…");

try {
  await auth.api.signUpEmail({
    body: { email, password, name: "Admin" },
  });
  spinner.stop(`Admin created: ${email}`);
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  spinner.stop("Failed");
  p.log.error(msg);
}
