"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getWebhookSchema } from "../schema";

export const getWebhookAction = authActionClient
  .schema(getWebhookSchema)
  .metadata({
    name: "get-webhook",
    track: {
      event: LogEvents.GetWebhook.name,
      channel: LogEvents.GetWebhook.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.webhooks.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get webhook: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
