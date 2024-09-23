"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { listAirlinesSchema } from "../schema";

export const listAirlinesAction = authActionClient
  .schema(listAirlinesSchema)
  .metadata({
    name: "list-airlines",
    track: {
      event: LogEvents.ListAirlines.name,
      channel: LogEvents.ListAirlines.channel,
    },
  })
  .action(async ({ limit, after, before }) => {
    try {
      const response = await duffel.airlines.list({ limit, after, before });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to list airlines: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
