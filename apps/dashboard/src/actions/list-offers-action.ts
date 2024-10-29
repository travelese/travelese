"use server";

import { authActionClient } from "@/actions/safe-action";
import { duffel } from "@/utils/duffel";
import { logger } from "@/utils/logger";
import { DuffelError } from "@duffel/api";
import { LogEvents } from "@travelese/events/events";
import { client as RedisClient } from "@travelese/kv";
import { nanoid } from "nanoid";
import { listOffersSchema } from "./schema";

export const listOffersAction = authActionClient
  .schema(listOffersSchema)
  .metadata({
    name: "list-offers",
    track: {
      event: LogEvents.ListOffers.name,
      channel: LogEvents.ListOffers.channel,
    },
  })
  .action(
    async ({ parsedInput: { offer_request_id, limit, after, before } }) => {
      try {
        const response = await duffel.offers.list({
          offer_request_id,
          ...(limit && { limit }),
          ...(after && { after }),
          ...(before && { before }),
        });
        const listOffersId = nanoid();

        logger("nanoid", listOffersId);

        await RedisClient.sadd(
          `list-offers:${listOffersId}`,
          JSON.stringify(response.data),
        );

        logger(`Saved to key: list-offers:${listOffersId}`);

        return {
          ...response.data,
          listOffersId,
        };
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
          `Failed to list offers: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    },
  );
