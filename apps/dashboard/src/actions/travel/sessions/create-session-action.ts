"use server";

import { LogEvents } from "@travelese/events/events";
import { duffel } from "../../../utils/duffel";
import { authActionClient } from "../../safe-action";
import { createSessionSchema } from "../schema";

export const createSessionAction = authActionClient
  .schema(createSessionSchema)
  .metadata({
    name: "create-session",
    track: {
      event: LogEvents.CreateSession.name,
      channel: LogEvents.CreateSession.channel,
    },
  })
  .action(async ({ parsedInput }) => {
    try {
      const response = await duffel.sessions.create(parsedInput);
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create session: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  });
