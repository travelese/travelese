"use server";

import { authActionClient } from "@/actions/safe-action";
import { createPartialOfferRequestSchema } from "@/actions/schema";
import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";

export const createPartialOfferRequestAction = authActionClient
  .schema(createPartialOfferRequestSchema)
  .metadata({
    name: "create-partial-offer-request",
    track: {
      event: LogEvents.CreatePartialOfferRequest.name,
      channel: LogEvents.CreatePartialOfferRequest.channel,
    },
  })
  .action(
    async ({
      parsedInput: {
        supplier_timeout,
        slices,
        passengers,
        private_fares,
        cabin_class,
        max_connections,
      },
    }) => {
      try {
        const response = await duffel.offerRequests.create({
          supplier_timeout,
          slices: slices.map((slice) => ({
            origin: slice.origin,
            destination: slice.destination,
            departure_date: slice.departure_date,
            ...(slice.departure_time && {
              departure_time: slice.departure_time,
            }),
            ...(slice.arrival_time && {
              arrival_time: slice.arrival_time,
            }),
          })),
          passengers: passengers.map((passenger) => ({
            type: passenger.type,
            ...(passenger.given_name && {
              given_name: passenger.given_name,
            }),
            ...(passenger.family_name && {
              family_name: passenger.family_name,
            }),
            ...(passenger.loyalty_programme_accounts && {
              loyalty_programme_accounts: passenger.loyalty_programme_accounts,
            }),
            ...(passenger.age && {
              age: passenger.age,
            }),
            ...(passenger.fare_type && {
              fare_type: passenger.fare_type,
            }),
          })),
          ...(private_fares && { private_fares }),
          ...(cabin_class && { cabin_class }),
          ...(max_connections && { max_connections }),
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
          `Failed to create partial offer request: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    },
  );
