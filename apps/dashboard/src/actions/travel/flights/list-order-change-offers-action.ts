"use server";

import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { listOrderChangeOffersSchema } from "../schema";

export const listOrderChangeOffersAction = authActionClient
  .schema(listOrderChangeOffersSchema)
  .metadata({
    name: "list-order-change-offers",
    track: {
      event: LogEvents.ListOrderChangeOffers.name,
      channel: LogEvents.ListOrderChangeOffers.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.orderChangeOffers.list({
        order_change_request_id: parsedInput.order_change_request_id,
        limit: parsedInput.limit,
        after: parsedInput.after,
        before: parsedInput.before,
      });
      return response.data;
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
        `Failed to list order change offers: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
