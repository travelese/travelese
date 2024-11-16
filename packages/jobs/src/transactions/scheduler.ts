import { logger, schedules } from "@trigger.dev/sdk/v3";
import { Jobs } from "../constants";

export const scheduler = schedules.task({
  id: Jobs.TRANSACTION_SCHEDULER,
  run: async () => {
    logger.info("Scheduler running", {
      id: Jobs.TRANSACTION_SCHEDULER,
    });
  },
});
