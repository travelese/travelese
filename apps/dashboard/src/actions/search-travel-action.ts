"use server";

import { authActionClient } from "@/actions/safe-action";
import { searchTravelSchema } from "@/actions/schema";
import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import type { PassengerType } from "@duffel/api/types";

import { LogEvents } from "@travelese/events/events";
import { client as RedisClient } from "@travelese/kv";
import { nanoid } from "nanoid";

export const searchTravelAction = authActionClient
  .schema(searchTravelSchema)
  .metadata({
    name: "search-travel",
    track: {
      event: LogEvents.SearchTravel.name,
      channel: LogEvents.SearchTravel.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      if (parsedInput.search_type === "flights") {
        // Create partial offer request
        const offerRequest = await duffel.offerRequests.create({
          slices: parsedInput.slices!.map((slice) => ({
            origin: slice.origin,
            destination: slice.destination,
            departure_date: slice.departure_date!,
          })),
          passengers: parsedInput.passengers!.map((passenger) => ({
            type: passenger.type as PassengerType,
          })),
          cabin_class: parsedInput.cabin_class as
            | "economy"
            | "premium_economy"
            | "business"
            | "first",
        });

        // Log the response from Duffel
        logger("Response from Duffel API:", offerRequest.data);

        // List offers
        const offers = await duffel.offers.list({
          offer_request_id: offerRequest.data.id,
        });

        const listOffersId = nanoid();
        await RedisClient.hset(`offers:${listOffersId}`, {
          offers: JSON.stringify(offers.data),
          timestamp: Date.now(),
        });

        // Log the response from Duffel
        logger("Response from Duffel API:", offers.data);

        return {
          type: "flight",
          offersId: listOffersId,
        };
      }

      if (parsedInput.search_type === "stays") {
        const accommodations = await duffel.stays.search({
          check_in_date: parsedInput.check_in_date!,
          check_out_date: parsedInput.check_out_date!,
          guests: parsedInput.guests!.map((guest) => ({
            type: guest.type,
            age: guest.age,
          })),
          location: parsedInput.location!,
          rooms: parsedInput.rooms!,
        });

        const listAccommodationsId = nanoid();
        await RedisClient.hset(`accommodations:${listAccommodationsId}`, {
          accommodations: JSON.stringify(accommodations.data),
          timestamp: Date.now(),
        });

        // Log the response from Duffel
        logger("Response from Duffel API:", accommodations.data);

        return {
          type: "stays",
          accommodationsId: `accommodations:${listAccommodationsId}`,
        };
      }
    } catch (error) {
      if (error instanceof DuffelError) {
        logger("Duffel API Error", {
          message: error.message,
          errors: error.errors,
          meta: error.meta,
        });
      } else {
        logger("Unexpected Error", error);
      }
      throw new Error(
        `Failed to search travel: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
