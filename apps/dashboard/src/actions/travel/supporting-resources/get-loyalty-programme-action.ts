"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getLoyaltyProgrammeSchema } from "../schema";

export const getLoyaltyProgrammeAction = authActionClient
  .schema(getLoyaltyProgrammeSchema)
  .metadata({
    name: "get-loyalty-programme",
    track: {
      event: LogEvents.GetLoyaltyProgramme.name,
      channel: LogEvents.GetLoyaltyProgramme.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.loyaltyProgrammes.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get loyalty programme: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
