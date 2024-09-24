"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { createComponentClientKeySchema } from "../schema";

export const createComponentClientKeyAction = authActionClient
  .schema(createComponentClientKeySchema)
  .metadata({
    name: "create-component-client-key",
    track: {
      event: LogEvents.CreateComponentClientKey.name,
      channel: LogEvents.CreateComponentClientKey.channel,
    },
  })
  .action(async ({ offer_id, client_key_type }) => {
    try {
      const response = await duffel.componentClientKeys.create({
        offer_id,
        client_key_type,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create component client key: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
