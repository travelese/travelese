import { z } from "zod";
import { CABIN_CLASSES, DUFFEL_PASSENGER_TYPES } from "./constants";

export const changeTravelModeSchema = z.enum(["flights", "stays"]);

export const changeTravelTypeSchema = z.enum([
  "return",
  "one_way",
  "multi_city",
  "nomad",
]);

export const changeTravelCabinSchema = z.enum([
  "economy",
  "premium_economy",
  "business",
  "first_class",
]);

export const changeTravelPassengerSchema = z.enum([
  "adult",
  "child",
  "infant_without_seat",
]);

export const changeTravelLuggageSchema = z.enum(["cabin", "checked"]);

export const changeTravelPeriodSchema = z.object({
  from: z.string(),
  to: z.string().optional(),
});

const travelTypeSchema = z.enum(["one_way", "return", "multi_city", "nomad"]);

export const createTravelShareSchema = z.object({
  baseUrl: z.string().url(),
  from: z.string(),
  to: z.string(),
  type: travelTypeSchema,
  expiresAt: z.string().datetime().optional(),
});

export const createOfferRequestSchema = z.object({
  parsedInput: z.object({
    slices: z.array(
      z.object({
        origin: z.string(),
        destination: z.string(),
        departure_date: z.string(),
      }),
    ),
    passengers: z.array(
      z.object({
        type: z.enum([
          DUFFEL_PASSENGER_TYPES.ADULT,
          DUFFEL_PASSENGER_TYPES.CHILD,
          DUFFEL_PASSENGER_TYPES.INFANT_WITHOUT_SEAT,
        ]),
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
      .enum([
        CABIN_CLASSES.FIRST,
        CABIN_CLASSES.BUSINESS,
        CABIN_CLASSES.PREMIUM_ECONOMY,
        CABIN_CLASSES.ECONOMY,
      ])
      .optional(),
    return_offers: z.boolean().optional(),
    max_connections: z.number().min(0).max(2).optional(),
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
  }),
});

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
      type: z.enum([
        DUFFEL_PASSENGER_TYPES.ADULT,
        DUFFEL_PASSENGER_TYPES.CHILD,
        DUFFEL_PASSENGER_TYPES.INFANT_WITHOUT_SEAT,
      ]),
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
    .enum([
      CABIN_CLASSES.BUSINESS,
      CABIN_CLASSES.ECONOMY,
      CABIN_CLASSES.FIRST,
      CABIN_CLASSES.PREMIUM_ECONOMY,
    ])
    .optional(),
  max_connections: z
    .union([z.literal(0), z.literal(1), z.literal(2)])
    .optional(),
});

export const getPartialOfferRequestSchema = z.object({
  id: z.string(),
  selected_partial_offer_ids: z.array(z.string()).optional(),
});

export const getFullOfferFaresSchema = z.object({
  id: z.string(),
  selected_partial_offer_ids: z.array(z.string()),
});

export const listOffersSchema = z.object({
  offer_request_id: z.string(),
  limit: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
});

export const getOfferSchema = z.object({
  id: z.string(),
});

export const getOfferRequestSchema = z.object({
  id: z.string(),
});

export const updateOfferPassengerSchema = z.object({
  offer_id: z.string(),
  passenger_id: z.string(),
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
});

export const createOrderSchema = z.object({
  selected_offers: z.array(z.string()),
  passengers: z.array(
    z.object({
      type: z.enum([
        "adult",
        "child",
        "infant_without_seat",
        "infant_with_seat",
      ]),
      title: z.enum(["mr", "ms", "mrs", "miss", "dr"]).optional(),
      gender: z.enum(["m", "f"]),
      given_name: z.string(),
      family_name: z.string(),
      born_on: z.string(),
      email: z.string().email(),
      phone_number: z.string(),
      id_document_type: z
        .enum(["passport", "identity_card", "other"])
        .optional(),
      id_document_number: z.string().optional(),
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
  payments: z.array(
    z.object({
      type: z.enum(["balance", "arc_bsp_cash", "card", "instant_payment"]),
      amount: z.string(),
      currency: z.string(),
    }),
  ),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const listOrderServicesSchema = z.object({
  order_id: z.string(),
});

export const addOrderServiceSchema = z.object({
  order_id: z.string(),
  services: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().int().positive(),
    }),
  ),
});

export const getOrderSchema = z.object({
  id: z.string(),
});

export const updateOrderSchema = z.object({
  id: z.string(),
  metadata: z.record(z.string(), z.string()),
});

export const listOrdersSchema = z.object({
  limit: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
  awaiting_payment: z.boolean().optional(),
  booking_reference: z.string().optional(),
  created_at: z
    .object({
      gt: z.string().optional(),
      gte: z.string().optional(),
      lt: z.string().optional(),
      lte: z.string().optional(),
    })
    .optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  passenger_name: z.string().optional(),
});

export const createPaymentSchema = z.object({
  order_id: z.string(),
  payment: z.object({
    type: z.enum(["balance", "card"]),
    amount: z.string(),
    currency: z.string(),
  }),
});

export const getSeatMapsSchema = z.object({
  offer_id: z.string(),
});

export const listOrderCancellationsSchema = z.object({
  order_id: z.string(),
  limit: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
});

export const getOrderCancellationSchema = z.object({
  id: z.string(),
});

export const createOrderCancellationSchema = z.object({
  order_id: z.string(),
});

export const confirmOrderCancellationSchema = z.object({
  id: z.string(),
});

export const createOrderChangeSchema = z.object({
  order_id: z.string(),
  slices: z.object({
    remove: z.array(
      z.object({
        slice_id: z.string(),
      }),
    ),
    add: z.array(
      z.object({
        origin: z.string(),
        destination: z.string(),
        departure_date: z.string(),
        cabin_class: z
          .enum(["first", "business", "premium_economy", "economy"])
          .optional(),
      }),
    ),
  }),
});

export const getOrderChangeSchema = z.object({
  id: z.string(),
});

export const getOrderChangeOfferSchema = z.object({
  id: z.string(),
});

export const listOrderChangeOffersSchema = z.object({
  order_change_request_id: z.string(),
  limit: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
});

export const createPendingOrderChangeSchema = z.object({
  selected_order_change_offer: z.string(),
});

export const confirmOrderChangeSchema = z.object({
  id: z.string(),
});

export const createBatchOfferRequestSchema = z.object({
  slices: z.array(
    z.object({
      origin: z.string(),
      destination: z.string(),
      departure_date: z.string(),
      arrival_time: z
        .object({
          from: z.string().optional(),
          to: z.string().optional(),
        })
        .optional(),
      departure_time: z
        .object({
          from: z.string().optional(),
          to: z.string().optional(),
        })
        .optional(),
    }),
  ),
  passengers: z.array(
    z.object({
      type: z
        .enum(["adult", "child", "infant_without_seat", "infant_with_seat"])
        .optional(),
      age: z.number().optional(),
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
  private_fares: z
    .record(
      z.array(
        z.object({
          corporate_code: z.string().optional(),
          tracking_reference: z.string().optional(),
          tour_code: z.string().optional(),
        }),
      ),
    )
    .optional(),
  max_connections: z.number().optional(),
});

export const getBatchOfferRequestSchema = z.object({
  id: z.string(),
});

export const listAirlineInitiatedChangesSchema = z.object({
  order_id: z.string(),
});

export const acceptAirlineInitiatedChangeSchema = z.object({
  id: z.string(),
});

export const updateAirlineInitiatedChangeSchema = z.object({
  id: z.string(),
  metadata: z.record(z.string(), z.string()),
});

export const searchAccommodationSchema = z.object({
  check_in_date: z.string(),
  check_out_date: z.string(),
  rooms: z.number(),
  guests: z.array(
    z.object({
      type: z.enum(["adult", "child", "infant"]),
      age: z.number().optional(),
    }),
  ),
  location: z.object({
    radius: z.number(),
    geographic_coordinates: z.object({
      longitude: z.number(),
      latitude: z.number(),
    }),
  }),
});

export const fetchAllRatesSchema = z.object({
  search_result_id: z.string(),
});

export const createQuoteForRateSchema = z.object({
  rate_id: z.string(),
});

export const createBookingSchema = z.object({
  quote_id: z.string(),
  guests: z.array(
    z.object({
      given_name: z.string(),
      family_name: z.string(),
      born_on: z.string().optional(),
    }),
  ),
  email: z.string().email(),
  phone_number: z.string(),
  accommodation_special_requests: z.string().optional(),
  stay_special_requests: z.string().optional(),
});

export const getBookingSchema = z.object({
  id: z.string(),
});

export const cancelBookingSchema = z.object({
  id: z.string(),
});

export const searchAccommodationSuggestionsSchema = z.object({
  query: z.string(),
  limit: z.number().optional(),
});

export const getAccommodationSchema = z.object({
  id: z.string(),
});

export const listLoyaltyProgrammesSchema = z.object({
  limit: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
  airline_iata_code: z.string().optional(),
});

export const getBrandSchema = z.object({
  id: z.string(),
});

export const listBrandsSchema = z.object({
  limit: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
});

export const getAirlineSchema = z.object({
  id: z.string(),
});

export const listAirlinesSchema = z.object({
  limit: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
});

export const getAircraftSchema = z.object({
  id: z.string(),
});

export const listAircraftSchema = z.object({
  limit: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
});

export const listAirportsSchema = z.object({
  limit: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
  iata_country_code: z.string().optional(),
  iata_code: z.string().optional(),
  icao_code: z.string().optional(),
});

export const getAirportSchema = z.object({
  id: z.string(),
});

export const listCitiesSchema = z.object({
  limit: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
  iata_country_code: z.string().optional(),
  iata_code: z.string().optional(),
});

export const getCitySchema = z.object({
  id: z.string(),
});

export const listPlaceSuggestionsSchema = z.object({
  query: z.string(),
  type: z.enum(["airport", "city"]).optional(),
  limit: z.number().optional(),
});

export const getLoyaltyProgrammeSchema = z.object({
  id: z.string(),
});

export const createCustomerUserSchema = z.object({
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string().optional(),
  title: z.enum(["mr", "ms", "mrs", "miss"]).optional(),
});

export const updateCustomerUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().optional(),
  title: z.enum(["mr", "ms", "mrs", "miss"]).optional(),
});

export const getCustomerUserSchema = z.object({
  id: z.string(),
});

export const createComponentClientKeySchema = z.object({
  offer_id: z.string(),
  client_key_type: z.enum(["ancillaries"]),
});

export const listWebhooksSchema = z.object({
  limit: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
});

export const getWebhookEventSchema = z.object({
  id: z.string(),
});

export const retryWebhookEventSchema = z.object({
  id: z.string(),
});

export const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()),
});

export const getWebhookSchema = z.object({
  id: z.string(),
});

export const deleteWebhookSchema = z.object({
  id: z.string(),
});

export const pingWebhookSchema = z.object({
  id: z.string(),
});

export const getWebhookDeliverySchema = z.object({
  id: z.string(),
});

export const listWebhookDeliveriesSchema = z.object({
  limit: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
  created_at: z
    .object({
      gt: z.string().optional(),
      gte: z.string().optional(),
      lt: z.string().optional(),
      lte: z.string().optional(),
    })
    .optional(),
  type: z.string().optional(),
  delivery_success: z.boolean().optional(),
  endpoint_id: z.string().optional(),
});

export const createSessionSchema = z.object({
  abandonment_url: z.string().url(),
  checkout_display_text: z.string().optional(),
  failure_url: z.string().url(),
  flights: z
    .object({
      enabled: z.boolean(),
    })
    .optional(),
  logo_url: z.string().url().optional(),
  markup_amount: z.string().optional(),
  markup_currency: z.string().optional(),
  markup_rate: z.string().optional(),
  primary_color: z.string().optional(),
  reference: z.string(),
  secondary_color: z.string().optional(),
  should_hide_traveller_currency_selector: z.boolean().optional(),
  stays: z
    .object({
      enabled: z.boolean(),
    })
    .optional(),
  success_url: z.string().url(),
  traveller_currency: z.string().optional(),
});
