"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { getCustomerUserSchema } from "../schema";

export const getCustomerUserAction = authActionClient
  .schema(getCustomerUserSchema)
  .metadata({
    name: "get-customer-user",
    track: {
      event: LogEvents.GetCustomerUser.name,
      channel: LogEvents.GetCustomerUser.channel,
    },
  })
  .action(async ({ id }) => {
    try {
      const response = await duffel.customerUsers.get(id);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to get customer user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
