import { beforeEach, describe, expect, it, vi } from "vitest";

const { postgresStoreMock } = vi.hoisted(() => ({
  postgresStoreMock: vi.fn(function PostgresStoreMock() {
    return {};
  }),
}));

vi.mock("@mastra/pg", () => ({
  PostgresStore: postgresStoreMock,
}));

import { createTelegramStorage } from "./mastra";

describe("createTelegramStorage", () => {
  beforeEach(() => {
    postgresStoreMock.mockClear();
  });

  it("disables certificate verification for the emergency Coolify CA workaround", () => {
    createTelegramStorage("postgres://example.test/results");

    expect(postgresStoreMock).toHaveBeenCalledWith({
      id: "telegram-agent",
      connectionString: "postgres://example.test/results",
      ssl: { rejectUnauthorized: false },
    });
  });
});
