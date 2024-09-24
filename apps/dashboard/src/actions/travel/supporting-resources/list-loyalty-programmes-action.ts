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
  .action(async ({ limit, after, before, airline_iata_code }) => {
    try {
      const response = await duffel.loyaltyProgrammes.list({
        limit,
        after,
        before,
        airline_iata_code,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to list loyalty programmes: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
