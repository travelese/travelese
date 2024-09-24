"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { createCustomerUserSchema } from "../schema";

export const createCustomerUserAction = authActionClient
  .schema(createCustomerUserSchema)
  .metadata({
    name: "create-customer-user",
    track: {
      event: LogEvents.CreateCustomerUser.name,
      channel: LogEvents.CreateCustomerUser.channel,
    },
  })
  .action(async (input) => {
    try {
      const response = await duffel.customerUsers.create(input);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create customer user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
