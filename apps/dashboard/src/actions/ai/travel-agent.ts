"use server";

import {
  listPlaceSuggestionsSchema,
  searchTravelSchema,
} from "@/actions/schema";
import { logger } from "@/utils/logger";
import { xai } from "@/utils/xai";
import { getUser } from "@travelese/supabase/cached-queries";
import { generateObject } from "ai";
import { addDays, formatISO } from "date-fns";
import { z } from "zod";

export async function travelAgent(input: string) {
  const user = await getUser();

  const { object } = await generateObject({
    model: xai("grok-beta"),
    system: `
      Current date: ${formatISO(new Date(), { representation: "date" })}
      Current User Name: ${user?.data?.full_name}
      Current User Email: ${user?.data?.email}

      You are an AI Aravel Agent that converts natural language into structured travel requests to enhance Traveller Experience.
      
      For Flights:
          - Detect flight type (one_way, return, multi_city)
          - Extract city or airport names as provided by user
          - Parse from and to dates in ISO-8601 format
          - Default to 
              cabin_class: economy
              passengers: 1 adult ${user?.data?.full_name}
              currency: USD
              departure_date: ${formatISO(new Date(), { representation: "date" })}
              max_connections: 2

        
      For Stays:
          - Extract location as provided by user
          - Parse check_in_date and check_out_date in ISO-8601 format
          - Default to 
              rooms: 1
              guests: 1 adult ${user?.data?.full_name}
              currency: USD
              check_in_date: ${formatISO(addDays(new Date(), 1), {
                representation: "date",
              })}
              check_out_date: ${formatISO(addDays(new Date(), 7), {
                representation: "date",
              })}
    `,
    schema: z.object({
      type: z.enum(["flights", "stays"]),
      dates: z.array(z.string()),
      places: z.array(listPlaceSuggestionsSchema),
      travel: searchTravelSchema,
    }),
    prompt: input,
    temperature: 0.2,
  });

  logger("travelAgent returning", {
    type: object.type,
    dates: object.dates,
    places: object.places,
    travel: JSON.stringify(object.travel),
  });
  return object;
}
