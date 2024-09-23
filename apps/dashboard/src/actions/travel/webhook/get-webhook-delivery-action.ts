"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getWebhookDeliverySchema } from "../schema";

export const getWebhookDeliveryAction = authActionClient
  .schema(getWebhookDeliverySchema)
  .metadata({
    name: "get-webhook-delivery",
    track: {
      event: LogEvents.GetWebhookDelivery.name,
      channel: LogEvents.GetWebhookDelivery.channel,
    },
  })
  .action(async ({ parsedInput: { id } }) => {
    try {
      const response = await duffel.webhookDeliveries.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get webhook delivery: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
