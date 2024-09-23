"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getCitySchema } from "../schema";

export const getCityAction = authActionClient
  .schema(getCitySchema)
  .metadata({
    name: "get-city",
    track: {
      event: LogEvents.GetCity.name,
      channel: LogEvents.GetCity.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.cities.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get city: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
