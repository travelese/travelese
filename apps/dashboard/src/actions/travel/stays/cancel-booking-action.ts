"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { cancelBookingSchema } from "../schema";

export const cancelBookingAction = authActionClient
  .schema(cancelBookingSchema)
  .metadata({
    name: "cancel-booking",
    track: {
      event: LogEvents.CancelBooking.name,
      channel: LogEvents.CancelBooking.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.stays.bookings.cancel(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to cancel booking: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
