"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getWebhookEventSchema } from "../schema";

export const getWebhookEventAction = authActionClient
  .schema(getWebhookEventSchema)
  .metadata({
    name: "get-webhook-event",
    track: {
      event: LogEvents.GetWebhookEvent.name,
      channel: LogEvents.GetWebhookEvent.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.webhookEvents.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get webhook event: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
