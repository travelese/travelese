"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { updateCustomerUserSchema } from "../schema";

export const updateCustomerUserAction = authActionClient
  .schema(updateCustomerUserSchema)
  .metadata({
    name: "update-customer-user",
    track: {
      event: LogEvents.UpdateCustomerUser.name,
      channel: LogEvents.UpdateCustomerUser.channel,
    },
  })
  .action(async ({ id, ...updateData }) => {
    try {
      const response = await duffel.customerUsers.update(id, updateData);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update customer user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
