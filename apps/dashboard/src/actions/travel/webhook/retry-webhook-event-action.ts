"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { retryWebhookEventSchema } from "../schema";

export const retryWebhookEventAction = authActionClient
  .schema(retryWebhookEventSchema)
  .metadata({
    name: "retry-webhook-event",
    track: {
      event: LogEvents.RetryWebhookEvent.name,
      channel: LogEvents.RetryWebhookEvent.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.webhookEvents.redeliver(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to retry webhook event: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
