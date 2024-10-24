import { z } from "zod";

export const changeTravelTypeSchema = z.enum([
  "return",
  "one_way",
  "multi_city",
  "digital_nomad",
]);

export const changeTravelCabinSchema = z.enum([
  "economy",
  "premium_economy",
  "business",
  "first_class",
]);

export const changeTravelTravellerSchema = z.array(
  z.object({
    type: z.enum(["adult", "child", "infant_without_seat"]),
  }),
);

export const changeTravelBaggageSchema = z.enum([
  "carry_on",
  "cabin",
  "checked",
]);

export const changeTravelLocationSchema = z.object({
  type: z.enum(["origin", "destination"]),
  value: z.string(),
});

export const changeTravelPeriodSchema = z.object({
  from: z.string(),
  to: z.string().optional(),
});

export const createOfferRequestSchema = z.object({
  slices: z.array(
    z.object({
      origin: z.string(),
      destination: z.string(),
      departure_date: z.string(),
    }),
  ),
  passengers: z.array(
    z.object({
      type: z.enum(["adult", "child", "infant_without_seat"]),
      given_name: z.string().optional(),
      family_name: z.string().optional(),
      loyalty_programme_accounts: z
        .array(
          z.object({
            airline_iata_code: z.string(),
            account_number: z.string(),
          }),
        )
        .optional(),
    }),
  ),
  cabin_class: z
    .enum(["first", "business", "premium_economy", "economy"])
    .optional(),
  return_offers: z.boolean().optional(),
  max_connections: z.number().int().min(0).max(2).optional(),
  private_fares: z
    .record(
      z.string(),
      z.array(
        z.object({
          corporate_code: z.string().optional(),
          tracking_reference: z.string().optional(),
          tour_code: z.string().optional(),
        }),
      ),
    )
    .optional(),
});

export type CreateOfferRequestValues = z.infer<typeof createOfferRequestSchema>;

export const createPartialOfferRequestSchema = z.object({
  supplier_timeout: z.number().optional(),
  slices: z.array(
    z.object({
      origin: z.string(),
      destination: z.string(),
      departure_time: z
        .object({
          from: z.string().datetime(),
          to: z.string().datetime(),
        })
        .optional(),
      departure_date: z.string(),
      arrival_time: z
        .object({
          from: z.string().datetime(),
          to: z.string().datetime(),
        })
        .optional(),
    }),
  ),
  private_fares: z.record(
    z.string(),
    z.array(
      z.object({
        corporate_code: z.string().optional(),
        tracking_reference: z.string().optional(),
        tour_code: z.string().optional(),
      }),
    ),
  ),
  passengers: z.array(
    z.object({
      type: z.enum(["adult", "child", "infant_without_seat"]),
      given_name: z.string().optional(),
      family_name: z.string().optional(),
      loyalty_programme_accounts: z
        .array(
          z.object({
            airline_iata_code: z.string(),
            account_number: z.string(),
          }),
        )
        .optional(),
    }),
  ),
  cabin_class: z
    .enum(["business", "economy", "first", "premium_economy"])
    .optional(),
  max_connections: z
    .union([z.literal(0), z.literal(1), z.literal(2)])
    .optional(),
});

export type CreatePartialOfferRequestValues = z.infer<
  typeof createPartialOfferRequestSchema
>;

export const listPlaceSuggestionsSchema = z.object({
  query: z.string(),
  rad: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
});
