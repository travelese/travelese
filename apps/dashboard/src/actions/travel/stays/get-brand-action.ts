"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getBrandSchema } from "../schema";

export const getBrandAction = authActionClient
  .schema(getBrandSchema)
  .metadata({
    name: "get-brand",
    track: {
      event: LogEvents.GetBrand.name,
      channel: LogEvents.GetBrand.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.stays.brands.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get brand: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
