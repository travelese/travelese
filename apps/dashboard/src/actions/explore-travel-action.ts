"use server";

import { authActionClient } from "@/actions/safe-action";
import {
  type FlightPosition,
  flightPositionsRequestSchema,
} from "@/actions/schema";
import { logger } from "@/utils/logger";
import { LogEvents } from "@travelese/events/events";
import { getBoundsOfDistance } from "geolib";

async function getFlights({
  geo_code,
  iata_code,
}: {
  geo_code: { latitude: number; longitude: number };
  iata_code: string;
}) {
  const { latitude, longitude } = geo_code;

  const baseUrl =
    "https://fr24api.flightradar24.com/api/live/flight-positions/full";
  const query = new URLSearchParams({
    bounds: getBounds(latitude, longitude), // show planes within 60km of airport
    altitude_ranges: "100-60000", // show flying planes only
    categories: "P,C", // show passenger and cargo planes only
  });

  const response = await fetch(`${baseUrl}?${query}`, {
    headers: {
      Accept: "application/json",
      "Accept-Version": "v1",
      Authorization: `Bearer ${process.env.FLIGHT_RADAR_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch plane details: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data.data as FlightPosition[];
}

function getBounds(latitude: number, longitude: number) {
  const radius = 120_000;
  const [southWest, northEast] = getBoundsOfDistance(
    { latitude, longitude },
    radius,
  );
  return `${northEast?.latitude},${southWest?.latitude},${southWest?.longitude},${northEast?.longitude}`;
}

export const exploreTravelAction = authActionClient
  .schema(flightPositionsRequestSchema)
  .metadata({
    name: "explore-travel",
    track: {
      event: LogEvents.ExploreTravel.name,
      channel: LogEvents.ExploreTravel.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const flights = await getFlights({
        geo_code: parsedInput.geo_code,
        iata_code: parsedInput.iata_code,
      });
      return { data: flights };
    } catch (error) {
      logger("Unexpected Error", error);
      throw new Error(
        `Failed to get flights: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  });
