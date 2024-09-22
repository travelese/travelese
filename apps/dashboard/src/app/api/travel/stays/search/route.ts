import { searchStays } from "@/lib/travel/duffel";
import type { StaysSearchParams } from "@duffel/api/types";
import { DuffelError } from "@duffel/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const check_in_date = searchParams.get("check_in_date");
    const check_out_date = searchParams.get("check_out_date");
    const rooms = searchParams.get("rooms")
      ? parseInt(searchParams.get("rooms") || "", 10)
      : undefined;
    const guests = searchParams.get("guests")
      ? JSON.parse(searchParams.get("guests") || "")
      : undefined;
    const latitude = searchParams.get("latitude")
      ? parseFloat(searchParams.get("latitude") || "")
      : undefined;
    const longitude = searchParams.get("longitude")
      ? parseFloat(searchParams.get("longitude") || "")
      : undefined;

    if (
      !check_in_date ||
      !check_out_date ||
      !rooms ||
      !guests ||
      !latitude ||
      !longitude
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
        },
      );
    }

    const params: StaysSearchParams = {
      check_in_date,
      check_out_date,
      rooms,
      guests,
      location: {
        geographic_coordinates: {
          latitude,
          longitude,
        },
        radius: 50, // You might want to make this configurable
      },
    };

    const accommodations = await searchStays(params);

    // Return the filtered and expanded accommodations
    return new Response(JSON.stringify(accommodations));
  } catch (error) {
    console.error("Error in stay search:", error);
    if (error instanceof DuffelError) {
      return new Response(
        JSON.stringify({
          error: "Duffel API Error",
          meta: error.meta,
          errors: error.errors,
          headers: Object.fromEntries(error.headers.entries()),
        }),
        {
          status: 500,
        },
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          details:
            error instanceof Error ? error.message : JSON.stringify(error),
        }),
        {
          status: 500,
        },
      );
    }
  }
}
