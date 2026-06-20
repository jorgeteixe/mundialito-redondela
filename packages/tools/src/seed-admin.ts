import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import * as p from "@clack/prompts";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const rootEnvLocalPath = fileURLToPath(
  new URL("../../../.env.local", import.meta.url),
);
const rootEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));
const packageEnvLocalPath = fileURLToPath(
  new URL("../.env.local", import.meta.url),
);
const packageEnvPath = fileURLToPath(new URL("../.env", import.meta.url));

loadEnv({
  path: [packageEnvLocalPath, packageEnvPath, rootEnvLocalPath, rootEnvPath],
});

const { db } = await import("@mr/db");
const schema = await import("@mr/db/schema");

const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ?? "seed-admin-placeholder-secret-xxxxx",
  baseURL: "http://localhost:3001",
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
  process.exit(0);
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  spinner.stop("Failed");
  p.log.error(msg);
  process.exit(1);
}
