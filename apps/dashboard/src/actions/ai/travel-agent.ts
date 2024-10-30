"use server";

import { logger } from "@/utils/logger";
import { xai } from "@/utils/xai";
import { getUser } from "@travelese/supabase/cached-queries";
import { generateObject, streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { z } from "zod";

export async function travelAgent(prompt: string) {
  logger("travelAgent started", { prompt });

  const user = await getUser();
  logger("travelAgent user data", { user });

  const stream = createStreamableValue();
  logger("travelAgent stream created", { stream });

  logger("travelAgent generateObject started");
  const { object } = await generateObject({
    model: xai("grok-beta"),
    system: `
        Current date: ${new Date().toISOString().split("T")[0]}
        Current User Name: ${user?.data?.full_name}

        You are an AI travel agent that converts natural language into structured travel requests.
        
        1. For flights:
          - Detail user preferences for flight bookings, including origin, destination, travel class preferences, and additional requirements like layover times or specific airlines. Utilize real-time data for optimal availability and pricing.
          - Detect travel_type (one_way, return, multi_city)
          - Extract city/airport names as provided by user
          - Parse from and to dates in ISO-8601 format
          - Default to economy cabin_class and 1 adult (user_id) and USD currency if not specified
        
        2. For stays:
          - Specify desired location, type of accommodation, check-in and check-out dates, and any special requests or amenities. Prioritize user comfort, cost efficiency, and proximity to attractions or business centers.
          - Extract location as provided by user
          - Parse check_in_date and check_out_date in ISO-8601 format
          - Handle room and guest specifications
          - Default to 1 room and 1 adult and USD currency if not specified
      
        3. Personalization: Infer and apply user preferences from travel history or contextual clues in the request, such as frequent flyer programs or hotel loyalty benefits.
        4. Real-Time Management: Be prepared to handle changes or cancellations, providing updates or alternatives based on the latest information from Duffel APIs.
        5. Your responses should be informative, helping users make the best choices for their travel needs with an emphasis on clarity, efficiency, and user satisfaction.
        `,
    schema: z.object({
      type: z.enum(["flight", "stay"]),
      flights: z
        .object({
          supplier_timeout: z.number().default(30000),
          slices: z.array(
            z.object({
              origin: z.string().describe("The origin airport"),
              destination: z.string().describe("The destination airport"),
              departure_date: z.string().describe("The departure date"),
              departure_time: z
                .object({
                  from: z.string().datetime().describe("The departure time"),
                  to: z.string().datetime().describe("The departure time"),
                })
                .optional(),
              arrival_time: z
                .object({
                  from: z.string().datetime().describe("The arrival time"),
                  to: z.string().datetime().describe("The arrival time"),
                })
                .optional(),
              cabin_class: z
                .enum(["business", "economy", "first", "premium_economy"])
                .describe("The cabin class")
                .optional(),
              max_connections: z
                .union([z.literal(0), z.literal(1), z.literal(2)])
                .describe("The maximum number of connections")
                .optional(),
            }),
          ),
          passengers: z.array(
            z.object({
              type: z.enum(["adult", "child", "infant_without_seat"]),
              given_name: z.string().describe("The passenger's given name"),
              family_name: z.string().describe("The passenger's family name"),
              loyalty_programme_accounts: z
                .array(
                  z.object({
                    airline_iata_code: z
                      .string()
                      .describe("The airline IATA code"),
                    account_number: z
                      .string()
                      .describe("The loyalty programme account number"),
                  }),
                )
                .optional(),
              fare_type: z.string().describe("The fare type").optional(),
            }),
          ),
        })
        .optional(),
      stays: z
        .object({
          check_in_date: z.string().describe("The check-in date"),
          check_out_date: z.string().describe("The check-out date"),
          rooms: z.number().describe("The number of rooms"),
          guests: z.array(
            z.object({
              type: z.enum(["adult", "child", "infant"]),
              age: z.number().describe("The age of the guest").optional(),
            }),
          ),
          location: z.object({
            radius: z.number().describe("The radius"),
            geographic_coordinates: z.object({
              longitude: z.number().describe("The longitude"),
              latitude: z.number().describe("The latitude"),
            }),
          }),
        })
        .optional(),
    }),
    prompt,
    temperature: 0.2,
  });

  logger("travelAgent returning", { object });
  return { object };
}
