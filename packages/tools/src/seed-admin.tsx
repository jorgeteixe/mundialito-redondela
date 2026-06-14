import React, { useState } from "react";
import { render, Text, Box } from "ink";
import TextInput from "ink-text-input";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@mr/db";
import * as schema from "@mr/db/schema";

const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "seed-admin-secret",
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
});

type Step = "email" | "password" | "done" | "error";

function App() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function createAdmin(e: string, p: string) {
    try {
      await auth.api.signUpEmail({
        body: { email: e, password: p, name: "Admin" },
      });
      setMessage(`Admin created: ${e}`);
      setStep("done");
    } catch (err) {
      setMessage(String(err));
      setStep("error");
    } finally {
      setTimeout(() => process.exit(0), 100);
    }
  }

  if (step === "email") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Seed admin user</Text>
        <Box gap={1}>
          <Text>Email:</Text>
          <TextInput
            value={email}
            onChange={setEmail}
            onSubmit={(v) => {
              setEmail(v);
              setStep("password");
            }}
          />
        </Box>
      </Box>
    );
  }

  if (step === "password") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold>Seed admin user</Text>
        <Text>Email: {email}</Text>
        <Box gap={1}>
          <Text>Password:</Text>
          <TextInput
            value={password}
            onChange={setPassword}
            mask="*"
            onSubmit={(v) => {
              setPassword(v);
              void createAdmin(email, v);
            }}
          />
        </Box>
      </Box>
    );
  }

  if (step === "done") {
    return <Text color="green">{message}</Text>;
  }

  return <Text color="red">Error: {message}</Text>;
}

render(<App />);
