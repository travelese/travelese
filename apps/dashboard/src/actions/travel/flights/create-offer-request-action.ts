"use server";

import { duffel } from "@/utils/duffel";
import type { CreateOfferRequest, OfferRequest } from "@duffel/api/types";
import { LogEvents } from "@travelese/events/events";
import { authActionClient } from "../../safe-action";
import { createOfferRequestSchema } from "../schema";

export const createOfferRequestAction = authActionClient
  .schema(createOfferRequestSchema)
  .metadata({
    name: "create-offer-request",
    track: {
      event: LogEvents.CreateOfferRequest.name,
      channel: LogEvents.CreateOfferRequest.channel,
    },
  })
  .action(
    async ({
      parsedInput: {
        slices,
        passengers,
        cabin_class,
        return_offers,
        max_connections,
        private_fares,
        tripType,
      },
    }) => {
      const offerRequest: CreateOfferRequest = {
        slices: slices.map((slice) => ({
          origin: slice.origin,
          destination: slice.destination,
          departure_date: slice.departure_date,
          departure_time: slice.departure_time,
          arrival_time: slice.arrival_time,
        })),
        passengers: Object.entries(passengers).flatMap(([type, count]) =>
          Array(count).fill({ type }),
        ),
        cabin_class,
        return_offers,
        max_connections: max_connections ?? 0,
        private_fares: private_fares ?? {},
      };

      // Remove the second slice for one-way trips
      if (tripType === "one_way") {
        offerRequest.slices = [offerRequest.slices[0]];
      }

      const response = await duffel.offerRequests.create(offerRequest);
      return response.data as OfferRequest;
    },
  );
