"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { deleteWebhookSchema } from "../schema";

export const deleteWebhookAction = authActionClient
  .schema(deleteWebhookSchema)
  .metadata({
    name: "delete-webhook",
    track: {
      event: LogEvents.DeleteWebhook.name,
      channel: LogEvents.DeleteWebhook.channel,
    },
  })
  .action(async ({ parsedInput: { id } }) => {
    try {
      await duffel.webhooks.delete(id);
      return { success: true };
    } catch (error) {
      throw new Error(
        `Failed to delete webhook: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
