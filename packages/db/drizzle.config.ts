import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

const rootEnvLocalPath = fileURLToPath(
  new URL("../../.env.local", import.meta.url),
);
const rootEnvPath = fileURLToPath(new URL("../../.env", import.meta.url));
const packageEnvLocalPath = fileURLToPath(
  new URL(".env.local", import.meta.url),
);
const packageEnvPath = fileURLToPath(new URL(".env", import.meta.url));

loadEnv({
  path: [packageEnvLocalPath, packageEnvPath, rootEnvLocalPath, rootEnvPath],
});

export default defineConfig({
  schema: "./src/schema/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
