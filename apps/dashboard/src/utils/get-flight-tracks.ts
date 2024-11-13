"use server"

export async function getFlightTracks(id: string) {
  const baseUrl = 'https://fr24api.flightradar24.com/api/flight-tracks';

  const query = new URLSearchParams({ flight_id: id });

  const response = await fetch(`${baseUrl}?${query}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Version': 'v1',
      Authorization: `Bearer ${process.env.FLIGHT_RADAR_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch flight tracks: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as FlightTracksResponse;

  return data?.[0]?.tracks || [];
}

type FlightTracksResponse = Array<{
  fr24_id: string;
  tracks: FlightTrack[];
}>;

type FlightTrack = {
  timestamp: string;
  lat: number;
  lon: number;
  alt: number;
  gspeed: number;
  vspeed: number;
  track: number;
  squawk: string;
  callsign: string | null;
  source: string;
};
