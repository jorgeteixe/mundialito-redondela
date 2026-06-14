import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@mr/db";
import * as schema from "@mr/db/schema";

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [
      "localhost:3001",
      "localhost:3099",
      "backstage.mundialitoredondela.com",
      "*.vercel.app",
    ],
    fallback: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
  },
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
});
