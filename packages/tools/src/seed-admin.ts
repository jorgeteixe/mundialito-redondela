import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import * as p from "@clack/prompts";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@mr/db";
import * as schema from "@mr/db/schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = path.resolve(
  __dirname,
  "../../../packages/db/drizzle",
);

const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "seed-admin-secret",
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
});

p.intro("Seed admin user");

const migrationSpinner = p.spinner();
migrationSpinner.start("Running migrations…");
await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
migrationSpinner.stop("Migrations up to date");

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
  process.exit(1);
}
