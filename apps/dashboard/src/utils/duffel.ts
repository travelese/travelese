import { env } from "@/lib/env.mjs";
import { Duffel, DuffelError } from "@duffel/api";

import type { Places } from "@duffel/api/Places/Suggestions/SuggestionsType";
import type { StaysBookingPayload } from "@duffel/api/Stays/Bookings/Bookings";
import type {
  CreateOfferRequest,
  CreateOfferRequestPassenger,
} from "@duffel/api/booking/OfferRequests/OfferRequestsTypes";
import type { Offer } from "@duffel/api/booking/Offers/OfferTypes";
import type { Order } from "@duffel/api/booking/Orders/OrdersTypes";
import type {
  CreateOrder,
  ListOffersParams,
  StaysBooking,
  StaysSearchParams,
  StaysSearchResult,
} from "@duffel/api/types";

export const duffel = new Duffel({
  token: env.DUFFEL_TRAVELESE_ACCESS_TOKEN,
});

export async function searchFlights(
  slices: CreateOfferRequest["slices"],
  passengers: CreateOfferRequestPassenger[],
  cabin_class?: CreateOfferRequest["cabin_class"],
  sort?: ListOffersParams["sort"],
  limit?: number,
): Promise<Offer[]> {
  try {
    const offerRequest = await duffel.offerRequests.create({
      slices,
      passengers,
      cabin_class,
      sort,
      return_offers: true,
    });

    let offers = offerRequest.data.offers as Offer[];
    if (limit) {
      offers = offers.slice(0, limit);
    }

    return offers;
  } catch (error) {
    throw new Error(
      `Failed to search flights: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function getOffer(offerId: string): Promise<Offer> {
  const response = await duffel.offers.get(offerId);
  return response.data;
}

export async function createOrder(params: CreateOrder): Promise<Order> {
  console.log("Creating order with params:", JSON.stringify(params, null, 2));
  try {
    const response = await duffel.orders.create(params);
    if (!response.data || !response.data.booking_reference) {
      throw new Error("Booking failed: No booking reference received");
    }
    return response.data;
  } catch (error) {
    if (error instanceof DuffelError && error.errors) {
      console.error("Duffel API Error:", JSON.stringify(error.errors, null, 2));
      const errorMessage = error.errors.map((e) => e.message).join(", ");
      throw new Error(`Failed to create order: ${errorMessage}`);
    } else if (error instanceof Error) {
      throw new Error(`Failed to create order: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while creating the order");
    }
  }
}

export async function getPlaceSuggestions(
  params: Parameters<typeof duffel.suggestions.list>[0],
): Promise<Places[]> {
  const response = await duffel.suggestions.list(params);
  return response.data;
}

export async function searchStays(
  params: StaysSearchParams,
): Promise<StaysSearchResult> {
  try {
    const response = await duffel.stays.search(params);

    return response.data;
  } catch (error) {
    console.error("Detailed error in searchAccommodations:", error);
    if (error instanceof DuffelError) {
      console.error("Duffel API Error details:", {
        meta: error.meta,
        errors: error.errors,
        headers: Object.fromEntries(error.headers.entries()),
      });
    }
    throw error;
  }
}

export async function bookStays(
  params: StaysBookingPayload,
): Promise<StaysBooking> {
  console.log(
    "Calling Duffel API to book accommodation with params:",
    JSON.stringify(params, null, 2),
  );
  try {
    const response = await duffel.stays.bookings.create(params);
    console.log(
      "Duffel API booking response:",
      JSON.stringify(response.data, null, 2),
    );
    return response.data;
  } catch (error) {
    console.error("Error in bookAccommodation:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    if (typeof error === "object" && error !== null) {
      console.error("Error object:", JSON.stringify(error, null, 2));
    }
    throw new Error(
      `Failed to book accommodation: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
