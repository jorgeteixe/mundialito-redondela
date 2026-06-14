import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../../../packages/db/src/schema/index";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = path.resolve(
  __dirname,
  "../../../packages/db/drizzle",
);

const TEST_DB_URL =
  process.env.DATABASE_URL ??
  "postgresql://mundialito:mundialito@localhost:5432/mundialito_test";

// Derive admin URL by swapping the database name to connect to the default DB
const ADMIN_DB_URL = TEST_DB_URL.replace(/\/[^/]+$/, "/mundialito");

export default async function globalSetup() {
  const adminClient = postgres(ADMIN_DB_URL, { max: 1 });
  try {
    await adminClient`CREATE DATABASE mundialito_test`;
  } catch {
    // already exists — fine
  } finally {
    await adminClient.end();
  }

  const migrationClient = postgres(TEST_DB_URL, { max: 1 });
  const db = drizzle(migrationClient, { schema });

  await migrate(db, {
    migrationsFolder: MIGRATIONS_FOLDER,
  });

  await db.delete(schema.session);
  await db.delete(schema.account);
  await db.delete(schema.verification);
  await db.delete(schema.user);

  const auth = betterAuth({
    secret: "test-secret-do-not-use-in-production",
    database: drizzleAdapter(db, { provider: "pg", schema }),
    emailAndPassword: { enabled: true },
  });

  await auth.api.signUpEmail({
    body: {
      email: "admin@test.com",
      password: "testpassword123",
      name: "Test Admin",
    },
  });

  await migrationClient.end();
}
