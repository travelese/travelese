"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { pingWebhookSchema } from "../schema";

export const pingWebhookAction = authActionClient
  .schema(pingWebhookSchema)
  .metadata({
    name: "ping-webhook",
    track: {
      event: LogEvents.PingWebhook.name,
      channel: LogEvents.PingWebhook.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      await duffel.webhooks.ping(id);
      return { success: true };
    } catch (error) {
      throw new Error(
        `Failed to ping webhook: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
