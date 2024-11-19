import { isValid } from "date-fns";
import { z } from "zod";

export const updateUserSchema = z.object({
  full_name: z.string().min(2).max(32).optional(),
  avatar_url: z.string().url().optional(),
  locale: z.string().optional(),
  week_starts_on_monday: z.boolean().optional(),
  timezone: z.string().optional(),
  time_format: z.number().optional(),
  revalidatePath: z.string().optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export const trackingConsentSchema = z.boolean();

export const sendSupportSchema = z.object({
  subject: z.string(),
  priority: z.string(),
  type: z.string(),
  message: z.string(),
  url: z.string().optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(2).max(32).optional(),
  email: z.string().email().optional(),
  inbox_email: z.string().email().optional().nullable(),
  inbox_forwarding: z.boolean().optional().nullable(),
  logo_url: z.string().url().optional(),
  base_currency: z.string().optional(),
  document_classification: z.boolean().optional(),
  revalidatePath: z.string().optional(),
});

export type UpdateTeamFormValues = z.infer<typeof updateTeamSchema>;

export const subscribeSchema = z.object({
  email: z.string().email(),
  userGroup: z.string(),
});

export const deleteBankAccountSchema = z.object({
  id: z.string().uuid(),
});

export const updateBankAccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  enabled: z.boolean().optional(),
  balance: z.number().optional(),
  type: z
    .enum(["depository", "credit", "other_asset", "loan", "other_liability"])
    .optional()
    .nullable(),
});

export type DeleteBankAccountFormValues = z.infer<
  typeof deleteBankAccountSchema
>;

export const updateSubscriberPreferenceSchema = z.object({
  templateId: z.string(),
  teamId: z.string(),
  revalidatePath: z.string(),
  subscriberId: z.string(),
  type: z.string(),
  enabled: z.boolean(),
});

export const changeSpendingPeriodSchema = z.object({
  id: z.string(),
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export const changeChartTypeSchema = z.enum([
  "profit",
  "revenue",
  "expense",
  "burn_rate",
]);

export const changeChartPeriodSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const changeTransactionsPeriodSchema = z.enum([
  "all",
  "income",
  "expense",
]);

export const createAttachmentsSchema = z.array(
  z.object({
    path: z.array(z.string()),
    name: z.string(),
    size: z.number(),
    transaction_id: z.string(),
    type: z.string(),
  }),
);

export const deleteAttachmentSchema = z.string();

export const exportTransactionsSchema = z.array(z.string());

export const deleteFileSchema = z.object({
  id: z.string(),
  path: z.array(z.string()),
});

export const deleteFolderSchema = z.object({
  path: z.array(z.string()),
});

export const createFolderSchema = z.object({
  path: z.string(),
  name: z.string(),
});

export const unenrollMfaSchema = z.object({
  factorId: z.string(),
});

export const mfaVerifySchema = z.object({
  factorId: z.string(),
  challengeId: z.string(),
  code: z.string(),
});

export const shareFileSchema = z.object({
  filepath: z.string(),
  expireIn: z.number(),
});

export const connectBankAccountSchema = z.object({
  provider: z.enum(["plaid"]),
  accounts: z.array(
    z.object({
      account_id: z.string(),
      bank_name: z.string(),
      balance: z.number().optional(),
      currency: z.string(),
      name: z.string(),
      institution_id: z.string(),
      enabled: z.boolean(),
      logo_url: z.string().nullable().optional(),
      type: z.enum([
        "credit",
        "depository",
        "other_asset",
        "loan",
        "other_liability",
      ]),
    }),
  ),
});

export const sendFeedbackSchema = z.object({
  feedback: z.string(),
});

export const updateTransactionSchema = z.object({
  id: z.string().uuid(),
  note: z.string().optional().nullable(),
  category_slug: z.string().optional(),
  assigned_id: z.string().uuid().optional(),
  recurring: z.boolean().optional().nullable(),
  frequency: z.enum(["weekly", "monthly", "annually"]).optional().nullable(),
  status: z.enum(["deleted", "excluded", "posted", "completed"]).optional(),
});

export type UpdateTransactionValues = z.infer<typeof updateTransactionSchema>;

export const deleteTransactionSchema = z.object({
  ids: z.array(z.string()),
});

export const deleteCategoriesSchema = z.object({
  ids: z.array(z.string()),
  revalidatePath: z.string(),
});

export const bulkUpdateTransactionsSchema = z.object({
  type: z.enum(["category", "note", "assigned", "status", "recurring"]),
  data: z.array(updateTransactionSchema),
});

export const updateSimilarTransactionsCategorySchema = z.object({
  id: z.string(),
});

export const updateSimilarTransactionsRecurringSchema = z.object({
  id: z.string(),
});

export const updaterMenuSchema = z.array(
  z.object({
    path: z.string(),
    name: z.string(),
  }),
);

export const changeTeamSchema = z.object({
  teamId: z.string(),
  redirectTo: z.string(),
});

export const createTeamSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
  redirectTo: z.string().optional(),
});

export const changeUserRoleSchema = z.object({
  userId: z.string(),
  teamId: z.string(),
  role: z.enum(["owner", "member"]),
  revalidatePath: z.string().optional(),
});

export const deleteTeamMemberSchema = z.object({
  userId: z.string(),
  teamId: z.string(),
  revalidatePath: z.string().optional(),
});

export const leaveTeamSchema = z.object({
  teamId: z.string(),
  redirectTo: z.string().optional(),
  role: z.enum(["owner", "member"]),
  revalidatePath: z.string().optional(),
});

export const deleteTeamSchema = z.object({
  teamId: z.string(),
});

export const inviteTeamMembersSchema = z.object({
  invites: z.array(
    z.object({
      email: z.string().email().optional(),
      role: z.enum(["owner", "member"]),
    }),
  ),
  redirectTo: z.string().optional(),
  revalidatePath: z.string().optional(),
});

export type InviteTeamMembersFormValues = z.infer<
  typeof inviteTeamMembersSchema
>;

export const createCategoriesSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      vat: z.string().optional(),
    }),
  ),
});

export type CreateCategoriesFormValues = z.infer<typeof createCategoriesSchema>;

export const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  color: z.string(),
  description: z.string().optional().nullable(),
  vat: z.string().optional().nullable(),
});

export type UpdateCategoriesFormValues = z.infer<typeof updateCategorySchema>;

export const deleteInviteSchema = z.object({
  id: z.string(),
  revalidatePath: z.string().optional(),
});

export const acceptInviteSchema = z.object({
  id: z.string(),
  revalidatePath: z.string().optional(),
});

export const declineInviteSchema = z.object({
  id: z.string(),
  revalidatePath: z.string().optional(),
});

export const inboxFilterSchema = z.enum(["done", "todo", "all"]);

export const updateInboxSchema = z.object({
  id: z.string(),
  status: z.enum(["deleted", "pending"]).optional(),
  display_name: z.string().optional(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  transaction_id: z.string().nullable().optional(),
});

export type UpdateInboxFormValues = z.infer<typeof updateInboxSchema>;

export const createBookingSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  estimate: z.number().optional(),
  billable: z.boolean().optional().default(false),
  rate: z.number().min(1).optional(),
  currency: z.string().optional(),
  status: z.enum(["in_progress", "completed"]).optional(),
  customer_id: z.string().uuid().nullable().optional(),
});

export const updateBookingSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  estimate: z.number().optional(),
  billable: z.boolean().optional().default(false),
  rate: z.number().min(1).optional(),
  currency: z.string().optional(),
  status: z.enum(["in_progress", "completed"]).optional(),
  customer_id: z.string().uuid().nullable().optional(),
});

export const deleteBookingSchema = z.object({
  id: z.string().uuid(),
});

export const deleteEntriesSchema = z.object({
  id: z.string().uuid(),
});

export const createReportSchema = z.object({
  baseUrl: z.string().url(),
  from: z.string(),
  to: z.string(),
  type: changeChartTypeSchema,
  expiresAt: z.string().datetime().optional(),
});

export const createBookingReportSchema = z.object({
  baseUrl: z.string().url(),
  bookingId: z.string().uuid(),
});

export const updateEntriesSchema = z.object({
  id: z.string().uuid().optional(),
  action: z.enum(["update", "create", "delete"]),
  date: z.string().optional(),
  duration: z.number().optional(),
  assigned_id: z.string().optional(),
  booking_id: z.string().optional(),
  description: z.string().optional(),
  start: z.string().datetime().optional(),
  stop: z.string().datetime().optional(),
});

export const manualSyncTransactionsSchema = z.object({
  connectionId: z.string().uuid(),
});

export const updateInstitutionUsageSchema = z.object({
  institutionId: z.string(),
});

export const verifyOtpSchema = z.object({
  token: z.string(),
  email: z.string(),
});

export const searchSchema = z.object({
  query: z.string().min(1),
  type: z.enum(["inbox", "categories"]),
  limit: z.number().optional(),
});

export const inboxOrder = z.boolean();

export const getVatRateSchema = z.object({
  name: z.string().min(2),
});

export const createBankAccountSchema = z.object({
  name: z.string(),
  currency: z.string().optional(),
});

export const createTransactionsSchema = z.object({
  accountId: z.string().uuid(),
  currency: z.string(),
  transactions: z.array(
    z.object({
      internal_id: z.string(),
      bank_account_id: z.string().uuid(),
      date: z.coerce.date(),
      name: z.string(),
      amount: z.number(),
      currency: z.string(),
      team_id: z.string(),
      status: z.enum(["posted"]),
      method: z.enum(["other"]),
      manual: z.boolean(),
      category_slug: z.enum(["income"]).nullable(),
    }),
  ),
});

export type CreateTransactionsFormValues = z.infer<
  typeof createTransactionsSchema
>;

export const assistantSettingsSchema = z.object({
  enabled: z.boolean().optional(),
});

export const parseDateSchema = z
  .date()
  .transform((value) => new Date(value))
  .transform((v) => isValid(v))
  .refine((v) => !!v, { message: "Invalid date" });

export const filterTransactionsSchema = z.object({
  name: z.string().optional().describe("The name to search for"),
  start: parseDateSchema
    .optional()
    .describe("The start date when to retrieve from. Return ISO-8601 format."),
  end: parseDateSchema
    .optional()
    .describe(
      "The end date when to retrieve data from. If not provided, defaults to the current date. Return ISO-8601 format.",
    ),
  attachments: z
    .enum(["exclude", "include"])
    .optional()
    .describe(
      "Whether to include or exclude results with attachments or receipts.",
    ),
  categories: z
    .array(z.string())
    .optional()
    .describe("The categories to filter by"),
  recurring: z
    .array(z.enum(["all", "weekly", "monthly", "annually"]))
    .optional()
    .describe("The recurring to filter by"),
});

export const filterVaultSchema = z.object({
  name: z.string().optional().describe("The name to search for"),
  tags: z.array(z.string()).optional().describe("The tags to filter by"),
  start: parseDateSchema
    .optional()
    .describe("The start date when to retrieve from. Return ISO-8601 format."),
  end: parseDateSchema
    .optional()
    .describe(
      "The end date when to retrieve data from. If not provided, defaults to the current date. Return ISO-8601 format.",
    ),
  owners: z.array(z.string()).optional().describe("The owners to filter by"),
});

export const filterTravelSchema = z.object({
  name: z.string().optional().describe("The name to search for"),
  start: parseDateSchema
    .optional()
    .describe("The start date when to retrieve from. Return ISO-8601 format."),
  end: parseDateSchema
    .optional()
    .describe(
      "The end date when to retrieve data from. If not provided, defaults to the current date. Return ISO-8601 format.",
    ),
  status: z
    .enum(["in_progress", "completed"])
    .optional()
    .describe("The status to filter by"),
});

export const filterInvoiceSchema = z.object({
  name: z.string().optional().describe("The name to search for"),
  statuses: z
    .array(z.enum(["draft", "overdue", "paid", "unpaid", "canceled"]))
    .optional()
    .describe("The statuses to filter by"),
  start: parseDateSchema
    .optional()
    .describe("The start date when to retrieve from. Return ISO-8601 format."),
  end: parseDateSchema
    .optional()
    .describe(
      "The end date when to retrieve data from. If not provided, defaults to the current date. Return ISO-8601 format.",
    ),
  customers: z
    .array(z.string())
    .optional()
    .describe("The customers to filter by"),
});

export const createTransactionSchema = z.object({
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
  bank_account_id: z.string(),
  assigned_id: z.string().optional(),
  category_slug: z.string().optional(),
  note: z.string().optional(),
  attachments: z
    .array(
      z.object({
        path: z.array(z.string()),
        name: z.string(),
        size: z.number(),
        type: z.string(),
      }),
    )
    .optional(),
});

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;

export const createCustomerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  email: z.string().email(),
  country: z.string().nullable().optional(),
  address_line_1: z.string().nullable().optional(),
  address_line_2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zip: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});

// Travel
const travelModeSchema = z.enum(["flights", "stays"]);
const travelTypeSchema = z.enum(["one_way", "return", "multi_city"]);
const travelCabinSchema = z.enum([
  "economy",
  "premium_economy",
  "business",
  "first_class",
]);
const travelTravellerSchema = z.enum(["adult", "child", "infant_without_seat"]);
const travelBaggageSchema = z.enum(["carry_on", "cabin", "checked"]);

export const changeTravelModeSchema = travelModeSchema;
export const changeTravelTypeSchema = travelTypeSchema;
export const changeTravelCabinSchema = travelCabinSchema;
export const changeTravelTravellerSchema = z.array(
  z.object({
    type: travelTravellerSchema,
  }),
);
export const changeTravelBaggageSchema = travelBaggageSchema;

export const changeTravelLocationSchema = z.object({
  type: z.enum(["origin", "destination"]),
  value: z.string(),
});

export const changeTravelPeriodSchema = z.object({
  from: z.string(),
  to: z.string().optional(),
});

export const searchTravelSchema = z.object({
  search_type: z.enum(["flights", "stays"]),

  // Common fields
  user_id: z.string(),
  currency: z.string(),

  // Flights search params
  travel_type: travelTypeSchema.optional(),
  cabin_class: travelCabinSchema.optional(),
  passengers: z
    .array(
      z.object({
        type: travelTravellerSchema,
        given_name: z.string().min(1, "First name is required").optional(),
        family_name: z.string().min(1, "Last name is required").optional(),
        age: z.number().optional(),
      }),
    )
    .default([]),
  bags: z
    .object({
      carry_on: z.number().min(0),
      cabin: z.number().min(0),
      checked: z.number().min(0),
    })
    .optional(),
  slices: z
    .array(
      z.object({
        origin: z.string().min(3),
        destination: z.string().min(3),
        departure_date: z.string(),
      }),
    )
    .min(1)
    .optional(),

  // Stays search params
  check_in_date: z.string().optional(),
  check_out_date: z.string().optional(),
  rooms: z.number().optional(),
  location: z
    .object({
      radius: z.number(),
      geographic_coordinates: z.object({
        longitude: z.number(),
        latitude: z.number(),
      }),
    })
    .optional(),
  guests: z
    .array(
      z.object({
        type: z.enum(["adult", "child", "infant"]),
        age: z.number().optional(),
      }),
    )
    .optional(),
});

export const bookTravelSchema = z.object({
  booking_type: z.enum(["flights", "stays"]),

  // Common fields
  user_id: z.string(),
  currency: z.string(),

  // Flights booking params
  offer_id: z.string().optional(),
  passengers: z
    .array(
      z.object({
        type: z.enum(["adult", "child", "infant_without_seat"]),
        title: z.string(),
        given_name: z.string(),
        family_name: z.string(),
        born_on: z.string(),
        email: z.string().email(),
        phone_number: z.string(),
      }),
    )
    .optional(),

  // Stays booking params
  accommodation_id: z.string().optional(),
  rate_id: z.string().optional(),
  guest_info: z
    .object({
      email: z.string().email(),
      phone_number: z.string(),
      guests: z.array(
        z.object({
          type: z.enum(["adult", "child"]),
          given_name: z.string(),
          family_name: z.string(),
        }),
      ),
    })
    .optional(),
});

export const changeTravelSchema = z.object({
  change_type: z.enum(["flights", "stays"]),

  // Common fields
  user_id: z.string(),
  currency: z.string(),

  // Flights change params
  order_change: z
    .object({
      order_id: z.string(),
      slices: z.array(
        z.object({
          departure_date: z.string(),
          destination: z.string(),
          origin: z.string(),
          cabin_class: z.enum([
            "economy",
            "premium_economy",
            "first",
            "business",
          ]),
        }),
      ),
    })
    .optional(),

  // Stays cancellation params
  booking_cancellation: z
    .object({
      booking_id: z.string(),
      cancellation_reason: z.string().optional(),
    })
    .optional(),
});

const passengerSchema = z.object({
  type: z.enum(["adult", "child", "infant_without_seat"]).optional(),
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
  fare_type: z.string().optional(),
});

const sliceSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  departure_date: z.string(),
  departure_time: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
  arrival_time: z
    .object({
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
});

export const createPartialOfferRequestSchema = z.object({
  cabin_class: z
    .enum(["first", "business", "premium_economy", "economy"])
    .optional(),
  max_connections: z.number().optional(),
  passengers: z.array(passengerSchema),
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
  slices: z.array(sliceSchema),
  supplier_timeout: z.number().optional(),
});

const citySchema = z.object({
  name: z.string(),
  id: z.string(),
  iata_country_code: z.string(),
  iata_code: z.string(),
});

const airportSchema = z.object({
  time_zone: z.string(),
  name: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  id: z.string(),
  icao_code: z.string(),
  iata_country_code: z.string(),
  iata_code: z.string(),
  iata_city_code: z.string(),
  city_name: z.string(),
  city: citySchema,
});

const createPartialOfferLocationSchema = z.object({
  type: z.literal("airport"),
  time_zone: z.string(),
  name: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  id: z.string(),
  icao_code: z.string(),
  iata_country_code: z.string(),
  iata_code: z.string(),
  iata_city_code: z.string(),
  city_name: z.string(),
  city: citySchema,
  airports: z.array(airportSchema),
});

const carrierSchema = z.object({
  name: z.string(),
  logo_symbol_url: z.string(),
  logo_lockup_url: z.string(),
  id: z.string(),
  iata_code: z.string(),
  conditions_of_carriage_url: z.string(),
});

const createPartialOfferResponseSchema = z.object({
  data: z.object({
    slices: z.array(
      z.object({
        origin_type: z.literal("airport"),
        origin: createPartialOfferLocationSchema,
        destination_type: z.literal("airport"),
        destination: createPartialOfferLocationSchema,
        departure_date: z.string(),
      }),
    ),
    offers: z.array(
      z.object({
        total_emissions_kg: z.string(),
        total_currency: z.string(),
        total_amount: z.string(),
        tax_currency: z.string(),
        tax_amount: z.string(),
        supported_passenger_identity_document_types: z.array(z.string()),
        slices: z.array(
          z.object({
            segments: z.array(
              z.object({
                stops: z.array(
                  z.object({
                    id: z.string(),
                    duration: z.string(),
                    departing_at: z.string(),
                    arriving_at: z.string(),
                    airport: createPartialOfferLocationSchema,
                  }),
                ),
                passengers: z.array(
                  z.object({
                    passenger_id: z.string(),
                    fare_basis_code: z.string(),
                    cabin_class_marketing_name: z.string(),
                    cabin_class: z.string(),
                    cabin: z.object({
                      name: z.string(),
                      marketing_name: z.string(),
                      amenities: z.object({
                        wifi: z.object({
                          cost: z.string(),
                          available: z.string(),
                        }),
                        seat: z.object({
                          type: z.string(),
                          pitch: z.string(),
                          legroom: z.string(),
                        }),
                        power: z.object({
                          available: z.string(),
                        }),
                      }),
                    }),
                    baggages: z.array(
                      z.object({
                        type: z.string(),
                        quantity: z.number(),
                      }),
                    ),
                  }),
                ),
                origin_terminal: z.string(),
                origin: airportSchema,
                operating_carrier_flight_number: z.string(),
                operating_carrier: carrierSchema,
                marketing_carrier_flight_number: z.string(),
                marketing_carrier: carrierSchema,
                id: z.string(),
                duration: z.string(),
                distance: z.string(),
                destination_terminal: z.string(),
                destination: airportSchema,
                departing_at: z.string(),
                arriving_at: z.string(),
                aircraft: z.object({
                  name: z.string(),
                  id: z.string(),
                  iata_code: z.string(),
                }),
              }),
            ),
            origin_type: z.literal("airport"),
            origin: createPartialOfferLocationSchema,
            ngs_shelf: z.number(),
            id: z.string(),
            fare_brand_name: z.string(),
            duration: z.string(),
            destination_type: z.literal("airport"),
            destination: createPartialOfferLocationSchema,
            conditions: z.object({
              priority_check_in: z.string(),
              priority_boarding: z.string(),
              change_before_departure: z.object({
                penalty_currency: z.string(),
                penalty_amount: z.string(),
                allowed: z.boolean(),
              }),
              advance_seat_selection: z.string(),
            }),
            comparison_key: z.string(),
          }),
        ),
        private_fares: z.array(
          z.object({
            type: z.string(),
            tracking_reference: z.string(),
            tour_code: z.string(),
            corporate_code: z.string(),
          }),
        ),
        payment_requirements: z.object({
          requires_instant_payment: z.boolean(),
          price_guarantee_expires_at: z.string(),
          payment_required_by: z.string(),
        }),
        passengers: z.array(
          z.object({
            type: z.string(),
            loyalty_programme_accounts: z.array(
              z.object({
                airline_iata_code: z.string(),
                account_number: z.string(),
              }),
            ),
            id: z.string(),
            given_name: z.string(),
            fare_type: z.string(),
            family_name: z.string(),
            age: z.number(),
          }),
        ),
        passenger_identity_documents_required: z.boolean(),
        partial: z.boolean(),
        owner: carrierSchema,
        live_mode: z.boolean(),
        id: z.string(),
        expires_at: z.string(),
        created_at: z.string(),
        conditions: z.object({
          refund_before_departure: z.object({
            penalty_currency: z.string(),
            penalty_amount: z.string(),
            allowed: z.boolean(),
          }),
          change_before_departure: z.object({
            penalty_currency: z.string(),
            penalty_amount: z.string(),
            allowed: z.boolean(),
          }),
        }),
        base_currency: z.string(),
        base_amount: z.string(),
      }),
    ),
    live_mode: z.boolean(),
    id: z.string(),
    created_at: z.string(),
    client_key: z.string(),
    cabin_class: z.string(),
  }),
});

export const listOffersSchema = z.object({
  offer_request_id: z.string(),
  limit: z.number().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
});

const offerSchema = z.object({
  total_emissions_kg: z.string(),
  total_currency: z.string(),
  total_amount: z.string(),
  tax_currency: z.string(),
  tax_amount: z.string(),
  supported_passenger_identity_document_types: z.array(z.string()),
  slices: z.array(
    z.object({
      segments: z.array(
        z.object({
          stops: z.array(
            z.object({
              id: z.string(),
              duration: z.string(),
              departing_at: z.string(),
              arriving_at: z.string(),
              airport: createPartialOfferLocationSchema,
            }),
          ),
          passengers: z.array(
            z.object({
              passenger_id: z.string(),
              fare_basis_code: z.string(),
              cabin_class_marketing_name: z.string(),
              cabin_class: z.string(),
              cabin: z.object({
                name: z.string(),
                marketing_name: z.string(),
                amenities: z.object({
                  wifi: z.object({
                    cost: z.string(),
                    available: z.string(),
                  }),
                  seat: z.object({
                    type: z.string(),
                    pitch: z.string(),
                    legroom: z.string(),
                  }),
                  power: z.object({
                    available: z.string(),
                  }),
                }),
              }),
              baggages: z.array(
                z.object({
                  type: z.string(),
                  quantity: z.number(),
                }),
              ),
            }),
          ),
          origin_terminal: z.string(),
          origin: airportSchema,
          operating_carrier_flight_number: z.string(),
          operating_carrier: carrierSchema,
          marketing_carrier_flight_number: z.string(),
          marketing_carrier: carrierSchema,
          id: z.string(),
          duration: z.string(),
          distance: z.string(),
          destination_terminal: z.string(),
          destination: airportSchema,
          departing_at: z.string(),
          arriving_at: z.string(),
          aircraft: z.object({
            name: z.string(),
            id: z.string(),
            iata_code: z.string(),
          }),
        }),
      ),
      origin_type: z.literal("airport"),
      origin: createPartialOfferLocationSchema,
      ngs_shelf: z.number(),
      id: z.string(),
      fare_brand_name: z.string(),
      duration: z.string(),
      destination_type: z.literal("airport"),
      destination: createPartialOfferLocationSchema,
      conditions: z.object({
        priority_check_in: z.string(),
        priority_boarding: z.string(),
        change_before_departure: z.object({
          penalty_currency: z.string(),
          penalty_amount: z.string(),
          allowed: z.boolean(),
        }),
        advance_seat_selection: z.string(),
      }),
      comparison_key: z.string(),
    }),
  ),
  private_fares: z.array(
    z.object({
      type: z.string(),
      tracking_reference: z.string(),
      tour_code: z.string(),
      corporate_code: z.string(),
    }),
  ),
  payment_requirements: z.object({
    requires_instant_payment: z.boolean(),
    price_guarantee_expires_at: z.string(),
    payment_required_by: z.string(),
  }),
  passengers: z.array(
    z.object({
      type: z.string(),
      loyalty_programme_accounts: z.array(
        z.object({
          airline_iata_code: z.string(),
          account_number: z.string(),
        }),
      ),
      id: z.string(),
      given_name: z.string(),
      fare_type: z.string(),
      family_name: z.string(),
      age: z.number(),
    }),
  ),
  passenger_identity_documents_required: z.boolean(),
  partial: z.boolean(),
  owner: carrierSchema,
  live_mode: z.boolean(),
  id: z.string(),
  expires_at: z.string(),
  created_at: z.string(),
  conditions: z.object({
    refund_before_departure: z.object({
      penalty_currency: z.string(),
      penalty_amount: z.string(),
      allowed: z.boolean(),
    }),
    change_before_departure: z.object({
      penalty_currency: z.string(),
      penalty_amount: z.string(),
      allowed: z.boolean(),
    }),
  }),
  base_currency: z.string(),
  base_amount: z.string(),
});

const listOffersResponseSchema = z.object({
  meta: z.object({
    limit: z.number(),
    after: z.string(),
  }),
  data: z.array(offerSchema),
});

export const searchAccommodationRequestSchema = z.object({
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

const rateSchema = z.object({
  total_currency: z.string(),
  total_amount: z.string(),
  tax_currency: z.string(),
  tax_amount: z.string(),
  supported_loyalty_programme: z.string(),
  quantity_available: z.number(),
  payment_type: z.string(),
  id: z.string(),
  fee_currency: z.string(),
  fee_amount: z.string(),
  due_at_accommodation_currency: z.string(),
  due_at_accommodation_amount: z.string(),
  conditions: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    }),
  ),
  cancellation_timeline: z.array(
    z.object({
      refund_amount: z.string(),
      currency: z.string(),
      before: z.string(),
    }),
  ),
  board_type: z.string(),
  base_currency: z.string(),
  base_amount: z.string(),
  available_payment_methods: z.array(z.array(z.string())),
});

const photoSchema = z.object({
  url: z.string(),
});

const bedSchema = z.object({
  type: z.string(),
  count: z.number(),
});

const roomSchema = z.object({
  rates: z.array(rateSchema),
  photos: z.array(photoSchema),
  name: z.string(),
  beds: z.array(bedSchema),
});

const addressSchema = z.object({
  region: z.string(),
  postal_code: z.string(),
  line_one: z.string(),
  country_code: z.string(),
  city_name: z.string(),
});

const searchAccommodationLocationSchema = z.object({
  geographic_coordinates: z.object({
    longitude: z.number(),
    latitude: z.number(),
  }),
  address: addressSchema,
});

const checkInInformationSchema = z.object({
  check_out_before_time: z.string(),
  check_in_after_time: z.string(),
});

const chainSchema = z.object({
  name: z.string(),
});

const brandSchema = z.object({
  name: z.string(),
  id: z.string(),
});

const amenitySchema = z.object({
  type: z.string(),
  description: z.string(),
});

const accommodationSchema = z.object({
  supported_loyalty_programme: z.string(),
  rooms: z.array(roomSchema),
  review_score: z.number(),
  rating: z.number(),
  photos: z.array(photoSchema),
  phone_number: z.string(),
  name: z.string(),
  location: searchAccommodationLocationSchema,
  key_collection: z.object({
    instructions: z.string(),
  }),
  id: z.string(),
  email: z.string(),
  description: z.string(),
  check_in_information: checkInInformationSchema,
  chain: chainSchema,
  brand: brandSchema,
  amenities: z.array(amenitySchema),
});

const searchAccommodationResultSchema = z.object({
  rooms: z.number(),
  id: z.string(),
  check_out_date: z.string(),
  check_in_date: z.string(),
  cheapest_rate_total_amount: z.string(),
  cheapest_rate_currency: z.string(),
  accommodation: accommodationSchema,
});

const searchAccommodationResponseSchema = z.object({
  data: z.object({
    results: z.array(searchAccommodationResultSchema),
    created_at: z.string(),
  }),
});

export const listPlaceSuggestionsSchema = z.object({
  query: z.string(),
  rad: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
});

export const placeSchema = z.object({
  type: z.string(),
  time_zone: z.string(),
  name: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  id: z.string(),
  icao_code: z.string(),
  iata_country_code: z.string(),
  iata_code: z.string(),
  iata_city_code: z.string(),
  city_name: z.string(),
  city: citySchema,
  airports: z.array(airportSchema),
});

export const listPlacesSuggestionsResponseSchema = z.object({
  data: z.array(placeSchema),
});
