import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../../packages/db/src/schema/index.js";

const TEST_DB_URL =
  process.env.DATABASE_URL ??
  "postgresql://mundialito:mundialito@localhost:5432/mundialito_test";

export default async function globalTeardown() {
  const client = postgres(TEST_DB_URL, { max: 1 });
  const db = drizzle(client, { schema });

  await db.delete(schema.session);
  await db.delete(schema.account);
  await db.delete(schema.verification);
  await db.delete(schema.user);

  await client.end();
}
