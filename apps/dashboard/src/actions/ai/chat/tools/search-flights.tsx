import type { MutableAIState } from "@/actions/ai/types";
import { createOfferRequestAction } from "@/actions/travel/create-offer-request-action";
import { listPlaceSuggestionsAction } from "@/actions/travel/list-place-suggestions-action";
import type { Offer } from "@duffel/api/types";
import { addWeeks, formatISO } from "date-fns";
import { nanoid } from "nanoid";
import { z } from "zod";
import { FlightsUI } from "./ui/flights-ui";

type Args = {
  aiState: MutableAIState;
};

export function searchFlights({ aiState }: Args) {
  return {
    description: "Search for flights",
    parameters: z.object({
      origin: z.string().describe("Origin city or airport"),
      destination: z.string().describe("Destination city or airport"),
      departure_date: z
        .date()
        .transform((date) => formatISO(date, { representation: "date" }))
        .describe("Departure date"),
      return_date: z
        .date()
        .optional()
        .transform(
          (date) => date && formatISO(date, { representation: "date" }),
        )
        .describe("Return date"),
      adults: z.number().default(1).describe("Number of adult passengers"),
      children: z.number().default(0).describe("Number of child passengers"),
      infants: z.number().default(0).describe("Number of infant passengers"),
      cabin_class: z
        .enum(["economy", "premium_economy", "business", "first"])
        .default("economy"),
    }),
    generate: async (args) => {
      const {
        origin,
        destination,
        departure_date,
        return_date,
        adults,
        children,
        infants,
        cabin_class,
      } = args;

      // Find IATA codes for origin and destination
      const originSuggestions = await listPlaceSuggestionsAction({
        query: origin,
      });
      const destinationSuggestions = await listPlaceSuggestionsAction({
        query: destination,
      });

      const originIATA =
        originSuggestions?.data?.find((s) => s.type === "airport")?.iata_code ||
        "YYZ";
      const destinationIATA = destinationSuggestions?.data?.find(
        (s) => s.type === "airport",
      )?.iata_code;

      if (!destinationIATA) {
        return "I'm sorry, I couldn't find a valid airport for the destination. Please try specifying the city or airport name more precisely.";
      }

      // Set departure date to next week if not provided
      const departureDate = departure_date || new Date(addWeeks(new Date(), 1));

      const passengers = [
        ...Array(adults).fill({ type: "adult" }),
        ...Array(children).fill({ type: "child" }),
        ...Array(infants).fill({ type: "infant_without_seat" }),
      ].map((passenger, index) => ({
        ...passenger,
        given_name: `Passenger ${index + 1}`,
        family_name: `Surname ${index + 1}`,
      }));

      const slices = [
        {
          origin: originIATA,
          destination: destinationIATA,
          departure_date: departureDate,
        },
        ...(return_date
          ? [
              {
                origin: destinationIATA,
                destination: originIATA,
                departure_date: return_date,
              },
            ]
          : []),
      ];

      const offerRequestData = {
        parsedInput: {
          slices,
          passengers,
          cabin_class,
        },
        limit: 5,
      };

      const result = await createOfferRequestAction(offerRequestData);

      if (!result || "error" in result) {
        console.error(
          "Error creating offer request:",
          result?.error || "Unknown error",
        );
        return "I'm sorry, there was an error while searching for flights. Please try again later.";
      }

      const offers: Omit<Offer, "available_services">[] =
        result.data?.offers || [];
      const toolCallId = nanoid();

      const props = {
        offers,
      };

      aiState.done({
        ...aiState.get(),
        messages: [
          ...aiState.get().messages,
          {
            id: nanoid(),
            role: "assistant",
            content: [
              {
                type: "tool-call",
                toolName: "createOfferRequest",
                toolCallId,
                args,
              },
            ],
          },
          {
            id: nanoid(),
            role: "tool",
            content: [
              {
                type: "tool-result",
                toolName: "createOfferRequest",
                toolCallId,
                result: props,
              },
            ],
          },
        ],
      });

      return <FlightsUI offerRequest={props} />;
    },
  };
}
