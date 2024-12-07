"use server";

import { authActionClient } from "@/actions/safe-action";
import { exploreTravelSchema } from "@/actions/schema";
import { logger } from "@/utils/logger";
import { LogEvents } from "@travelese/events/events";
import { getBoundsOfDistance } from "geolib";

type Flight = {
  fr24_id: string;
  flight: string;
  callsign: string;
  lat: number;
  lon: number;
  track: number;
  alt: number;
  gspeed: number;
  vspeed: number;
  squawk: string;
  timestamp: string;
  source: string;
  hex: string;
  type: string;
  reg: string;
  painted_as: string;
  operating_as: string;
  orig_iata: string;
  orig_icao: string;
  dest_iata: string;
  dest_icao: string;
  eta: string;
};

async function getFlights({ explore }: { explore: string }) {
  const [latitude, longitude] = explore.split(",").map(Number);

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
  return data.data as Flight[];
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
  .schema(exploreTravelSchema)
  .metadata({
    name: "explore-travel",
    track: {
      event: LogEvents.ExploreTravel.name,
      channel: LogEvents.ExploreTravel.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    console.log("Action received:", parsedInput);
    try {
      const flights = await getFlights({ explore: parsedInput.explore });
      return { data: flights };
    } catch (error) {
      logger("Unexpected Error", error);
      throw new Error(
        `Failed to get flights: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
