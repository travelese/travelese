"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { createQuoteForRateSchema } from "../schema";

export const createQuoteForRateAction = authActionClient
  .schema(createQuoteForRateSchema)
  .metadata({
    name: "create-quote-for-rate",
    track: {
      event: LogEvents.CreateQuoteForRate.name,
      channel: LogEvents.CreateQuoteForRate.channel,
    },
  })
  .action(async ({ rate_id }) => {
    try {
      const response = await duffel.stays.quotes.create(rate_id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create quote for rate: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
