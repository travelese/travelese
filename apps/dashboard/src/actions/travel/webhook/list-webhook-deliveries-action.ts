"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { listWebhookDeliveriesSchema } from "../schema";

export const listWebhookDeliveriesAction = authActionClient
  .schema(listWebhookDeliveriesSchema)
  .metadata({
    name: "list-webhook-deliveries",
    track: {
      event: LogEvents.ListWebhookDeliveries.name,
      channel: LogEvents.ListWebhookDeliveries.channel,
    },
  })
  .action(
    async ({
      parsedInput: {
        limit,
        after,
        before,
        created_at,
        type,
        delivery_success,
        endpoint_id,
      },
    }) => {
      try {
        const response = await duffel.webhookDeliveries.list({
          limit,
          after,
          before,
          created_at,
          type,
          delivery_success,
          endpoint_id,
        });
        return response.data;
      } catch (error) {
        throw new Error(
          `Failed to list webhook deliveries: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    },
  );
