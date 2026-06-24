import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

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

const migrationsFolder = fileURLToPath(
  new URL("../../db/drizzle", import.meta.url),
);

const { default: postgres } = await import("postgres");
const { drizzle } = await import("drizzle-orm/postgres-js");
const { migrate } = await import("drizzle-orm/postgres-js/migrator");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set.");
  process.exit(1);
}

const client = postgres(url, { max: 1 });

try {
  console.log("Dropping schema public…");
  await client.unsafe(
    "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; DROP SCHEMA IF EXISTS drizzle CASCADE;",
  );

  console.log("Applying migrations…");
  await migrate(drizzle(client), { migrationsFolder });

  console.log("Seeding…");
  const { seed } = await import("./seed");
  const { db } = await import("@mr/db");
  await seed(db);

  console.log("Database reset complete.");
  await client.end();
  process.exit(0);
} catch (err) {
  console.error(err);
  await client.end();
  process.exit(1);
}
