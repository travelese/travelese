import { geocode } from "@/utils/geocode";
import { getBoundsOfDistance } from "geolib";

export async function getFlights(params: Promise<{ airport: string }>) {
  const { airport } = await params;
  const { latitude, longitude } = geocode(airport);

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

// Utils

function getBounds(latitude: number, longitude: number) {
  const radius = 120_000;

  const [southWest, northEast] = getBoundsOfDistance(
    { latitude, longitude },
    radius,
  );

  // Return bounding box format expected by FR24
  return `${northEast.latitude},${southWest.latitude},${southWest.longitude},${northEast.longitude}`;
}

export type Flight = {
  fr24_id: string;
  flight: string;
  callsign: string;
  lat: number;
  lon: number;
  /** Current rotation of the plane, expressed in degrees */
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
