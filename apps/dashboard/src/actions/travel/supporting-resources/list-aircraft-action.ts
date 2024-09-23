"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { listAircraftSchema } from "../schema";

export const listAircraftAction = authActionClient
  .schema(listAircraftSchema)
  .metadata({
    name: "list-aircraft",
    track: {
      event: LogEvents.ListAircraft.name,
      channel: LogEvents.ListAircraft.channel,
    },
  })
  .action(async ({ limit, after, before }) => {
    try {
      const response = await duffel.aircraft.list({ limit, after, before });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to list aircraft: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
