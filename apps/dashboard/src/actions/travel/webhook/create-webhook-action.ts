"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { createWebhookSchema } from "../schema";

export const createWebhookAction = authActionClient
  .schema(createWebhookSchema)
  .metadata({
    name: "create-webhook",
    track: {
      event: LogEvents.CreateWebhook.name,
      channel: LogEvents.CreateWebhook.channel,
    },
  })
  .action(async ({ url, events }) => {
    try {
      const response = await duffel.webhooks.create({ url, events });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create webhook: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
