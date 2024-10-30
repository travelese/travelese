"use server";

import { authActionClient } from "@/actions/safe-action";
import { createPartialOfferRequestSchema } from "@/actions/schema";
import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import type { OfferRequest } from "@duffel/api/types";
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
        slices,
        passengers,
        supplier_timeout,
        private_fares,
        return_offers,
        sort,
      },
    }) => {
      try {
        const offerRequest = {
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
            ...(slice.cabin_class && {
              cabin_class: slice.cabin_class,
            }),
            ...(slice.max_connections !== undefined && {
              max_connections: slice.max_connections,
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
            ...(passenger.fare_type && {
              fare_type: passenger.fare_type,
            }),
          })),
          ...(private_fares && {
            private_fares,
          }),
          ...(return_offers !== undefined && {
            return_offers,
          }),
          ...(sort && {
            sort,
          }),
        };

        const response = await duffel.offerRequests.create(offerRequest);
        return response.data as OfferRequest;
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
