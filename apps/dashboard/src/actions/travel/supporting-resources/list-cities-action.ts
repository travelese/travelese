"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { listCitiesSchema } from "../schema";

export const listCitiesAction = authActionClient
  .schema(listCitiesSchema)
  .metadata({
    name: "list-cities",
    track: {
      event: LogEvents.ListCities.name,
      channel: LogEvents.ListCities.channel,
    },
  })
  .action(async ({ limit, after, before, iata_country_code, iata_code }) => {
    try {
      const response = await duffel.cities.list({
        limit,
        after,
        before,
        iata_country_code,
        iata_code,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to list cities: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
