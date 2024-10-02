"use server";

import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { logger } from "../../../utils/logger";
import { authActionClient } from "../../safe-action";
import { createPartialOfferRequestSchema } from "../schema";

export const createPartialOfferRequestAction = authActionClient
  .schema(createPartialOfferRequestSchema)
  .metadata({
    name: "create-partial-offer-request",
    track: {
      event: LogEvents.CreatePartialOfferRequest.name,
      channel: LogEvents.CreatePartialOfferRequest.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.partialOfferRequests.create({
        ...parsedInput,
      });
      logger("Duffel API Response", response);

      return response.data;
    } catch (error) {
      if (error instanceof DuffelError) {
        logger("Duffel API Error", {
          type: error.type,
          title: error.title,
          status: error.status,
          detail: error.detail,
          errors: error.errors,
          requestId: error.requestId,
        });
      } else {
        logger("Unexpected Error", error);
      }
      throw error;
    }
  });
