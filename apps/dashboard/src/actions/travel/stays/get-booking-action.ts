"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getBookingSchema } from "../schema";

export const getBookingAction = authActionClient
  .schema(getBookingSchema)
  .metadata({
    name: "get-booking",
    track: {
      event: LogEvents.GetBooking.name,
      channel: LogEvents.GetBooking.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.stays.bookings.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get booking: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
