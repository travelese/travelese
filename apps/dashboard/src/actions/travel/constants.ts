export const CABIN_CLASSES = {
  FIRST: "first",
  BUSINESS: "business",
  PREMIUM_ECONOMY: "premium_economy",
  ECONOMY: "economy",
} as const;

export const DUFFEL_PASSENGER_TYPES = {
  ADULT: "adult",
  CHILD: "child",
  INFANT_WITHOUT_SEAT: "infant_without_seat",
} as const;

export const DUFFEL_PASSENGER_GENDERS = {
  MALE: "m",
  FEMALE: "f",
} as const;

export const DUFFEL_PASSENGER_TITLES = {
  MR: "mr",
  MS: "ms",
  MRS: "mrs",
  MISS: "miss",
} as const;

export const PLACE_TYPES = {
  AIRPORT: "airport",
  CITY: "city",
} as const;

export const BAGGAGE_TYPES = {
  CARRY_ON: "carry_on",
  CHECKED: "checked",
} as const;

export const AIRLINE_INITIATED_CHANGE_ACTIONS_TAKEN = {
  ACCEPTED: "accepted",
  CANCELLED: "cancelled",
  CHANGED: "changed",
} as const;

export const AIRLINE_INITIATED_CHANGE_AVAILABLE_ACTIONS = {
  ACCEPT: "accept",
  CANCEL: "cancel",
  CHANGE: "change",
  UPDATE: "update",
} as const;

export const CREATE_OFFER_REQUEST_PASSENGER_FARE_TYPES = {
  ACCOMPANYING_ADULT: "accompanying_adult",
  CONTRACT_BULK: "contract_bulk",
  CONTRACT_BULK_CHILD: "contract_bulk_child",
  CONTRACT_BULK_INFANT_WITH_SEAT: "contract_bulk_infant_with_seat",
  CONTRACT_BULK_INFANT_WITHOUT_SEAT: "contract_bulk_infant_without_seat",
  FREQUENT_FLYER: "frequent_flyer",
  GROUP_INCLUSIVE_TOUR: "group_inclusive_tour",
  GROUP_INCLUSIVE_TOUR_CHILD: "group_inclusive_tour_child",
  HUMANITARIAN: "humanitarian",
  INDIVIDUAL_INCLUSIVE_TOUR_CHILD: "individual_inclusive_tour_child",
  MARINE: "marine",
  SEAT_ONLY: "seat_only",
  STUDENT: "student",
  TEACHER: "teacher",
  TOUR_OPERATOR_INCLUSIVE: "tour_operator_inclusive",
  TOUR_OPERATOR_INCLUSIVE_INFANT: "tour_operator_inclusive_infant",
  UNACCOMPANIED_CHILD: "unaccompanied_child",
  VISITING_FRIENDS_AND_FAMILY: "visiting_friends_and_family",
} as const;

export const WIFI_AMENITY_COSTS = {
  FREE: "free",
  PAID: "paid",
  FREE_OR_PAID: "free or paid",
  NA: "n/a",
} as const;

export const SEAT_PITCHES = {
  LESS: "less",
  MORE: "more",
  STANDARD: "standard",
  NA: "n/a",
} as const;

export const SEAT_TYPES = {
  STANDARD: "standard",
  EXTRA_LEGROOM: "extra_legroom",
  SKYCOUCH: "skycouch",
  RECLINER: "recliner",
  ANGLE_FLAT: "angle_flat",
  FULL_FLAT: "full_flat",
  PRIVATE_SUITE: "private_suite",
} as const;

export const OFFER_SUPPORTED_PASSENGER_IDENTITY_DOCUMENT_TYPES = {
  PASSPORT: "passport",
  TAX_ID: "tax_id",
  KNOWN_TRAVELER_NUMBER: "known_traveler_number",
  PASSENGER_REDRESS_NUMBER: "passenger_redress_number",
} as const;

export const ORDER_DOCUMENTS_TYPES = {
  ELECTRONIC_TICKET: "electronic_ticket",
  ELECTRONIC_MISCELLANEOUS_DOCUMENT_ASSOCIATED:
    "electronic_miscellaneous_document_associated",
  ELECTRONIC_MISCELLANEOUS_DOCUMENT_STANDALONE:
    "electronic_miscellaneous_document_standalone",
} as const;

export const PAYMENT_TYPES = {
  ARC_BSP_CASH: "arc_bsp_cash",
  BALANCE: "balance",
  CARD: "card",
  VOUCHER: "voucher",
  AWAITING_PAYMENT: "awaiting_payment",
  ORIGINAL_FORM_OF_PAYMENT: "original_form_of_payment",
} as const;

export const ORDER_CHANGE_SERVICE_TYPES = {
  BAGGAGE: "baggage",
  SEAT: "seat",
} as const;

export const ORDER_STATUSES = {
  CANCELLED: "cancelled",
  CONFIRMED: "confirmed",
  PENDING: "pending",
} as const;

export const PAYMENT_STATUSES = {
  NOT_PAID: "not_paid",
  PAID: "paid",
  PARTIALLY_PAID: "partially_paid",
} as const;

export const SYNC_STATUSES = {
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const PRIVATE_FARE_TYPES = {
  CORPORATE: "corporate",
  LEISURE: "leisure",
  NEGOTIATED: "negotiated",
} as const;

export const SORT_OPTIONS = {
  TOTAL_AMOUNT: "total_amount",
  TOTAL_DURATION: "total_duration",
} as const;

export const OFFER_SLICE_CONDITIONS_CHANGE_BEFORE_DEPARTURE = {
  ALLOWED: "allowed",
  NOT_ALLOWED: "not_allowed",
  RESTRICTED: "restricted",
} as const;

export const OFFER_SLICE_CONDITIONS_REFUND_BEFORE_DEPARTURE = {
  ALLOWED: "allowed",
  NOT_ALLOWED: "not_allowed",
  RESTRICTED: "restricted",
} as const;
