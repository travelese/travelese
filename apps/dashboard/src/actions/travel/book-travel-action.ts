"use server";

import { authActionClient } from "@/actions/safe-action";
import { bookTravelSchema } from "@/actions/schema";
import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";

export const bookTravelAction = authActionClient
  .schema(bookTravelSchema)
  .metadata({
    name: "book-travel",
    track: {
      event: LogEvents.BookTravel.name,
      channel: LogEvents.BookTravel.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      if (parsedInput.booking_type === "flights") {
        // Book flight using Duffel API
        const order = await duffel.orders.create({
          selected_offers: [parsedInput.offer_id!],
          passengers: parsedInput.passengers!.map((passenger) => ({
            type: passenger.type,
            title: passenger.title,
            given_name: passenger.given_name,
            family_name: passenger.family_name,
            born_on: passenger.born_on,
            email: passenger.email,
            phone_number: passenger.phone_number,
          })),
        });

        return {
          type: "flights",
          data: order.data,
        };
      }

      if (parsedInput.booking_type === "stays") {
        // Book stay using Duffel API
        const booking = await duffel.stays.book({
          accommodation_id: parsedInput.accommodation_id!,
          rate_id: parsedInput.rate_id!,
          guest_info: parsedInput.guest_info!,
        });

        return {
          type: "stays",
          data: booking.data,
        };
      }

      throw new Error("Invalid booking type");
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
        `Failed to book travel: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
