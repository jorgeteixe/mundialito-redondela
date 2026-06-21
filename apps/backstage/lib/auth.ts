import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, createAccessControl } from "better-auth/plugins";
import { db } from "@mr/db";
import * as schema from "@mr/db/schema";

const adminAccessControl = createAccessControl({
  user: [
    "create",
    "list",
    "set-role",
    "delete",
    "set-password",
    "set-email",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
} as const);

const viewerRole = adminAccessControl.newRole({
  user: [],
  session: [],
});

const adminRole = adminAccessControl.newRole({
  user: [],
  session: [],
});

const superAdminRole = adminAccessControl.newRole({
  user: [
    "create",
    "list",
    "set-role",
    "delete",
    "set-password",
    "set-email",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
});

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
  plugins: [
    admin({
      ac: adminAccessControl,
      roles: {
        viewer: viewerRole,
        admin: adminRole,
        "super-admin": superAdminRole,
      },
      adminRoles: ["super-admin"],
      defaultRole: "viewer",
    }),
  ],
});
