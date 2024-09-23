"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { createBookingSchema } from "../schema";

export const createBookingAction = authActionClient
  .schema(createBookingSchema)
  .metadata({
    name: "create-booking",
    track: {
      event: LogEvents.CreateBooking.name,
      channel: LogEvents.CreateBooking.channel,
    },
  })
  .action(async (input) => {
    try {
      const response = await duffel.stays.bookings.create(input);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create booking: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
