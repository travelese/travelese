"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getAirportSchema } from "../schema";

export const getAirportAction = authActionClient
  .schema(getAirportSchema)
  .metadata({
    name: "get-airport",
    track: {
      event: LogEvents.GetAirport.name,
      channel: LogEvents.GetAirport.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.airports.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get airport: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
