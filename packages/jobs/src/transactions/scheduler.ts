import { schedules } from "@trigger.dev/sdk/v3";
import { Jobs } from "../constants";

export const scheduler = schedules.task({
  id: Jobs.TRANSACTION_SCHEDULER,
  run: async () => {
    console.log("Scheduler running");
  },
});
