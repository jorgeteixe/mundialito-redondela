export const DUMMY_HEALTH_CHECK_TASK_ID = "dummy.health-check";

export type DummyHealthCheckPayload = {
  message?: string;
};

export type DummyHealthCheckOutput = {
  ok: true;
  receivedMessage: string | null;
  timestamp: string;
};
