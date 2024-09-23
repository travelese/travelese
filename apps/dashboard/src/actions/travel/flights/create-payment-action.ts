"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { createPaymentSchema } from "../schema";

export const createPaymentAction = authActionClient
  .schema(createPaymentSchema)
  .metadata({
    name: "create-payment",
    track: {
      event: LogEvents.CreatePayment.name,
      channel: LogEvents.CreatePayment.channel,
    },
  })
  .action(async ({ order_id, payment }) => {
    try {
      const response = await duffel.payments.create(order_id, payment);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create payment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
