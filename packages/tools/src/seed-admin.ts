import "dotenv/config";
import { createInterface } from "readline";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@mr/db";
import * as schema from "@mr/db/schema";

if (!process.stdin.isTTY) {
  console.error("seed-admin requires an interactive terminal (TTY).");
  process.exit(1);
}

const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "seed-admin-secret",
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
});

const rl = createInterface({ input: process.stdin, output: process.stdout });

const ask = (q: string) =>
  new Promise<string>((resolve) => rl.question(q, (a) => resolve(a.trim())));

const askHidden = (q: string) =>
  new Promise<string>((resolve) => {
    // Close readline before raw mode so they don't compete for stdin
    rl.close();
    process.stdout.write(q);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    let input = "";
    const onData = (buf: Buffer) => {
      const c = buf.toString("utf8");
      if (c === "\r" || c === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(input);
      } else if (c === "") {
        process.exit(0);
      } else if (c === "") {
        input = input.slice(0, -1);
      } else {
        input += c;
      }
    };
    process.stdin.on("data", onData);
  });

async function main() {
  const email = await ask("Email: ");
  const password = await askHidden("Password: ");

  try {
    await auth.api.signUpEmail({
      body: { email, password, name: "Admin" },
    });
    console.log(`✓ Admin created: ${email}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`✗ Error: ${msg}`);
    process.exit(1);
  }

  process.exit(0);
}

main();
