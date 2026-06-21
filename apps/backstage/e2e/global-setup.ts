import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { testAdmin } from "./test-constants";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backstageDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(backstageDir, "../..");

dotenv.config({ path: path.join(backstageDir, ".env.test"), quiet: true });

function quoteIdentifier(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function databaseName(databaseUrl: string) {
  const parsed = new URL(databaseUrl);
  const name = parsed.pathname.replace(/^\//, "");

  if (!name) {
    throw new Error("DATABASE_URL must include a database name");
  }

  return name;
}

function adminDatabaseUrl(databaseUrl: string) {
  const parsed = new URL(databaseUrl);
  parsed.pathname = "/postgres";
  return parsed.toString();
}

async function ensureDatabase(databaseUrl: string) {
  const name = databaseName(databaseUrl);
  const admin = postgres(adminDatabaseUrl(databaseUrl), {
    max: 1,
    onnotice: () => {},
  });

  try {
    const existing = await admin<{ exists: boolean }[]>`
      SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = ${name}) AS exists
    `;

    if (!existing[0]?.exists) {
      await admin.unsafe(`CREATE DATABASE ${quoteIdentifier(name)}`);
    }
  } finally {
    await admin.end();
  }
}

async function resetSchema(databaseUrl: string) {
  const sql = postgres(databaseUrl, { max: 1, onnotice: () => {} });
  const migrationsDir = path.join(repoRoot, "packages/db/drizzle");
  const migrationFiles = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  try {
    await sql`DROP SCHEMA IF EXISTS public CASCADE`;
    await sql`CREATE SCHEMA public`;

    for (const file of migrationFiles) {
      const migration = await fs.readFile(
        path.join(migrationsDir, file),
        "utf8",
      );

      for (const statement of migration.split("--> statement-breakpoint")) {
        const trimmed = statement.trim();

        if (trimmed) {
          await sql.unsafe(trimmed);
        }
      }
    }
  } finally {
    await sql.end();
  }
}

async function seedAdmin() {
  Object.assign(process.env, { NODE_ENV: "development" });

  const { auth } = await import("../lib/auth");
  const { db, schema } = await import("@mr/db");
  const { eq } = await import("drizzle-orm");

  await auth.api.signUpEmail({
    body: {
      email: testAdmin.email,
      password: testAdmin.password,
      name: testAdmin.name,
    },
  });
  await db
    .update(schema.user)
    .set({ role: "super-admin" })
    .where(eq(schema.user.email, testAdmin.email));
}

export default async function globalSetup() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for backstage E2E tests");
  }

  await ensureDatabase(databaseUrl);
  await resetSchema(databaseUrl);
  await seedAdmin();
}
