"use server";

import { authActionClient } from "@/actions/safe-action";
import { changeTravelSchema } from "@/actions/schema";
import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";

export const changeTravelAction = authActionClient
  .schema(changeTravelSchema)
  .metadata({
    name: "change-travel",
    track: {
      event: LogEvents.ChangeTravel.name,
      channel: LogEvents.ChangeTravel.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      if (parsedInput.change_type === "flights") {
        // Create order change request using Duffel API
        const changeRequest = await duffel.orderChangeRequests.create({
          order_id: parsedInput.order_id!,
          slices: parsedInput.slices!,
        });

        return {
          type: "flights",
          data: changeRequest.data,
        };
      }

      if (parsedInput.change_type === "stays") {
        // Cancel stay booking using Duffel API
        const cancellation = await duffel.stays.bookings.cancel(
          parsedInput.booking_cancellation!.booking_id,
        );

        return {
          type: "stays",
          data: cancellation.data,
        };
      }

      throw new Error("Invalid change type");
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
        `Failed to change travel: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
