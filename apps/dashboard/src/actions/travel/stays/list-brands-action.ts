"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { listBrandsSchema } from "../schema";

export const listBrandsAction = authActionClient
  .schema(listBrandsSchema)
  .metadata({
    name: "list-brands",
    track: {
      event: LogEvents.ListBrands.name,
      channel: LogEvents.ListBrands.channel,
    },
  })
  .action(async ({ limit, after, before }) => {
    try {
      const response = await duffel.stays.brands.list({ limit, after, before });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to list brands: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
