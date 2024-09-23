"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { listAirportsSchema } from "../schema";

export const listAirportsAction = authActionClient
  .schema(listAirportsSchema)
  .metadata({
    name: "list-airports",
    track: {
      event: LogEvents.ListAirports.name,
      channel: LogEvents.ListAirports.channel,
    },
  })
  .action(
    async ({
      limit,
      after,
      before,
      iata_country_code,
      iata_code,
      icao_code,
    }) => {
      try {
        const response = await duffel.airports.list({
          limit,
          after,
          before,
          iata_country_code,
          iata_code,
          icao_code,
        });
        return response.data;
      } catch (error) {
        throw new Error(
          `Failed to list airports: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    },
  );
