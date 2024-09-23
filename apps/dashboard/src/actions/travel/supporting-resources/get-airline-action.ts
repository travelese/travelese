"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getAirlineSchema } from "../schema";

export const getAirlineAction = authActionClient
  .schema(getAirlineSchema)
  .metadata({
    name: "get-airline",
    track: {
      event: LogEvents.GetAirline.name,
      channel: LogEvents.GetAirline.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.airlines.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get airline: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
