import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { spawn, type ChildProcess } from "child_process";
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

const ADMIN_DB_URL = TEST_DB_URL.replace(/\/[^/]+$/, "/mundialito");

const SERVER_URL = "http://localhost:3099";
let serverProcess: ChildProcess | null = null;

async function warmupRoutes(): Promise<void> {
  for (const path of ["/login", "/team"]) {
    try {
      await fetch(`${SERVER_URL}${path}`, { redirect: "manual" });
    } catch {}
  }
}

async function waitForServer(timeout = 120_000): Promise<void> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      await fetch(SERVER_URL);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`Server at ${SERVER_URL} did not start within ${timeout}ms`);
}

export default async function globalSetup() {
  // --- DB setup ---
  const adminClient = postgres(ADMIN_DB_URL, { max: 1 });
  try {
    await adminClient`CREATE DATABASE mundialito_test`;
  } catch {
    // already exists — fine
  } finally {
    await adminClient.end();
  }

  const migrationClient = postgres(TEST_DB_URL, { max: 1, onnotice: () => {} });
  const db = drizzle(migrationClient, { schema });

  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

  await db.delete(schema.session);
  await db.delete(schema.account);
  await db.delete(schema.verification);
  await db.delete(schema.user);

  const auth = betterAuth({
    secret: "test-secret-do-not-use-in-production",
    baseURL: SERVER_URL,
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

  // --- Web server ---
  const alreadyRunning = await fetch(SERVER_URL)
    .then(() => true)
    .catch(() => false);

  if (!alreadyRunning) {
    serverProcess = spawn("pnpm", ["exec", "next", "dev", "--port", "3099"], {
      cwd: path.resolve(__dirname, ".."),
      env: {
        ...process.env,
        DATABASE_URL: TEST_DB_URL,
        BETTER_AUTH_SECRET: "test-secret-do-not-use-in-production",
        BETTER_AUTH_URL: SERVER_URL,
        NEXT_PUBLIC_BETTER_AUTH_URL: SERVER_URL,
      },
      stdio: "ignore",
    });
    await waitForServer();
  }
  await warmupRoutes();
}

export async function teardown() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }

  const client = postgres(TEST_DB_URL, { max: 1, onnotice: () => {} });
  const db = drizzle(client, { schema });

  await db.delete(schema.session);
  await db.delete(schema.account);
  await db.delete(schema.verification);
  await db.delete(schema.user);

  await client.end();
}
