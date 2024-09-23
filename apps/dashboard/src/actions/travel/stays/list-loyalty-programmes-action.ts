"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { listLoyaltyProgrammesSchema } from "../schema";

export const listLoyaltyProgrammesAction = authActionClient
  .schema(listLoyaltyProgrammesSchema)
  .metadata({
    name: "list-loyalty-programmes",
    track: {
      event: LogEvents.ListLoyaltyProgrammes.name,
      channel: LogEvents.ListLoyaltyProgrammes.channel,
    },
  })
  .action(async ({ accommodation_id }) => {
    try {
      const response = await duffel.stays.accommodations.get(accommodation_id);
      return response.data.loyalty_programmes;
    } catch (error) {
      throw new Error(
        `Failed to list loyalty programmes: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
