"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getAircraftSchema } from "../schema";

export const getAircraftAction = authActionClient
  .schema(getAircraftSchema)
  .metadata({
    name: "get-aircraft",
    track: {
      event: LogEvents.GetAircraft.name,
      channel: LogEvents.GetAircraft.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.aircraft.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get aircraft: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
