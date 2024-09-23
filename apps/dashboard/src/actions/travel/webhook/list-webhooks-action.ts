"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { listWebhooksSchema } from "../schema";

export const listWebhooksAction = authActionClient
  .schema(listWebhooksSchema)
  .metadata({
    name: "list-webhooks",
    track: {
      event: LogEvents.ListWebhooks.name,
      channel: LogEvents.ListWebhooks.channel,
    },
  })
  .action(async ({ parsedInput: { limit, after, before } }) => {
    try {
      const response = await duffel.webhooks.list({ limit, after, before });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to list webhooks: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
