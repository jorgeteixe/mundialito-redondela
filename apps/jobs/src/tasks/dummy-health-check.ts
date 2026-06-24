import { logger, task } from "@trigger.dev/sdk";
import {
  DUMMY_HEALTH_CHECK_TASK_ID,
  type DummyHealthCheckOutput,
  type DummyHealthCheckPayload,
} from "../contracts";

export const dummyHealthCheck = task({
  id: DUMMY_HEALTH_CHECK_TASK_ID,
  run: async (
    payload: DummyHealthCheckPayload,
  ): Promise<DummyHealthCheckOutput> => {
    const receivedMessage = payload.message ?? null;
    const timestamp = new Date().toISOString();

    logger.info("Dummy Trigger.dev health check ran", {
      receivedMessage,
      timestamp,
    });

    return {
      ok: true,
      receivedMessage,
      timestamp,
    };
  },
});
