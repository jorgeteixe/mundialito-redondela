import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "../..");

loadEnv({
  path: [
    path.join(dirname, ".env.local"),
    path.join(dirname, ".env"),
    path.join(rootDir, ".env.local"),
    path.join(rootDir, ".env"),
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@mr/ui", "@mr/db"],
};

export default nextConfig;
