export const LogEvents = {
  Waitlist: {
    name: "User Joined Waitlist",
    channel: "waitlist",
  },
  SignIn: {
    name: "User Signed In",
    channel: "login",
  },
  SignOut: {
    name: "User Signed Out",
    channel: "login",
  },
  Registered: {
    name: "User Registered",
    channel: "registered",
  },
  ProjectCreated: {
    name: "Project Created",
    channel: "tracker",
  },
  ProjectDeleted: {
    name: "Project Deleted",
    channel: "tracker",
  },
  ProjectUpdated: {
    name: "Project Updated",
    channel: "tracker",
  },
  ProjectReport: {
    name: "Project Report",
    channel: "report",
  },
  TrackerCreateEntry: {
    name: "Tracker Create Entry",
    channel: "tracker",
  },
  TrackerDeleteEntry: {
    name: "Tracker Delete Entry",
    channel: "tracker",
  },
  ConnectBankCompleted: {
    name: "Connect Bank Completed",
    channel: "bank",
  },
  ConnectBankProvider: {
    name: "Connect Bank Provider",
    channel: "bank",
  },
  ConnectBankCanceled: {
    name: "Connect Bank Canceled",
    channel: "bank",
  },
  ConnectBankAuthorized: {
    name: "Connect Bank Authorized",
    channel: "bank",
  },
  ConnectBankFailed: {
    name: "Connect Bank Failed",
    channel: "bank",
  },
  BankAccountCreate: {
    name: "Create Bank Account",
    channel: "bank",
  },
  DeleteBank: {
    name: "Delete Bank",
    channel: "bank",
  },
  UpdateBank: {
    name: "Update Bank",
    channel: "bank",
  },
  OverviewReport: {
    name: "Overview Report",
    channel: "report",
  },
  AcceptInvite: {
    name: "Accept Invite",
    channel: "invite",
  },
  DeleteInvite: {
    name: "Delete Invite",
    channel: "invite",
  },
  DeclineInvite: {
    name: "Decline Invite",
    channel: "invite",
  },
  InviteTeamMembers: {
    name: "Invite Team Member",
    channel: "invite",
  },
  UserRoleChange: {
    name: "User Role Change",
    channel: "user",
  },
  DeleteUser: {
    name: "Delete User",
    channel: "user",
  },
  ChangeTeam: {
    name: "Change Team",
    channel: "team",
  },
  CreateTeam: {
    name: "Create Team",
    channel: "team",
  },
  LeaveTeam: {
    name: "Leave Team",
    channel: "team",
  },
  DeleteTeam: {
    name: "Delete Team",
    channel: "team",
  },
  DeleteTeamMember: {
    name: "Delete Team Member",
    channel: "team",
  },
  CreateAttachment: {
    name: "Create Attachment",
    channel: "transaction",
  },
  ExportTransactions: {
    name: "Export Transaction",
    channel: "transaction",
  },
  DeleteAttachment: {
    name: "Delete Attachment",
    channel: "transaction",
  },
  TransactionsManualSync: {
    name: "Manual Sync",
    channel: "transaction",
  },
  CreateFolder: {
    name: "Create Folder",
    channel: "vault",
  },
  DeleteFolder: {
    name: "Delete Folder",
    channel: "vault",
  },
  DeleteFile: {
    name: "Delete File",
    channel: "vault",
  },
  ShareFile: {
    name: "Share File",
    channel: "vault",
  },
  MfaVerify: {
    name: "MFA Verify",
    channel: "security",
  },
  SendFeedback: {
    name: "Send Feedback",
    channel: "feedback",
  },
  InboxInbound: {
    name: "Inbox Inbound",
    channel: "inbox",
  },
  ImportTransactions: {
    name: "Import Transactions",
    channel: "import",
  },
  SupportTicket: {
    name: "Support Ticket",
    channel: "support",
  },
  CategoryCreate: {
    name: "Category Create",
    channel: "category",
  },
  CategoryDelete: {
    name: "Category Delete",
    channel: "category",
  },
  CreateTransaction: {
    name: "Create Transaction",
    channel: "transaction",
  },
  UpdateBaseCurrency: {
    name: "Update Base Currency",
    channel: "transaction",
  },
  UpdateCurrency: {
    name: "Update Currency",
    channel: "transaction",
  },
  CreatePartialOfferRequest: {
    name: "create_partial_offer_request",
    channel: "travel",
  },
  GetPartialOfferRequest: {
    name: "get_partial_offer_request",
    channel: "travel",
  },
  GetFullOfferFares: {
    name: "get_full_offer_fares",
    channel: "travel",
  },
  ListOffers: {
    name: "list_offers",
    channel: "travel",
  },
  GetOffer: {
    name: "get_offer",
    channel: "travel",
  },
  UpdateOfferPassenger: {
    name: "update_offer_passenger",
    channel: "travel",
  },
  CreateOrder: {
    name: "create_order",
    channel: "travel",
  },
  ListOrderServices: {
    name: "list_order_services",
    channel: "travel",
  },
  AddOrderService: {
    name: "add_order_service",
    channel: "travel",
  },
  GetOrder: {
    name: "get_order",
    channel: "travel",
  },
  UpdateOrder: {
    name: "update_order",
    channel: "travel",
  },
  ListOrders: {
    name: "list_orders",
    channel: "travel",
  },
  CreatePayment: {
    name: "create_payment",
    channel: "travel",
  },
  GetSeatMaps: {
    name: "get_seat_maps",
    channel: "travel",
  },
  ListOrderCancellations: {
    name: "list_order_cancellations",
    channel: "travel",
  },
  GetOrderCancellation: {
    name: "get_order_cancellation",
    channel: "travel",
  },
  CreateOrderCancellation: {
    name: "create_order_cancellation",
    channel: "travel",
  },
  ConfirmOrderCancellation: {
    name: "confirm_order_cancellation",
    channel: "travel",
  },
  CreateOrderChange: {
    name: "create_order_change",
    channel: "travel",
  },
  GetOrderChange: {
    name: "get_order_change",
    channel: "travel",
  },
  ListOrderChangeOffers: {
    name: "list_order_change_offers",
    channel: "travel",
  },
  CreateBatchOfferRequest: {
    name: "create_batch_offer_request",
    channel: "travel",
  },
  GetBatchOfferRequest: {
    name: "get_batch_offer_request",
    channel: "travel",
  },
  ListAirlineInitiatedChanges: {
    name: "list_airline_initiated_changes",
    channel: "travel",
  },
  AcceptAirlineInitiatedChange: {
    name: "accept_airline_initiated_change",
    channel: "travel",
  },
  UpdateAirlineInitiatedChange: {
    name: "update_airline_initiated_change",
    channel: "travel",
  },
  SearchAccommodationSuggestions: {
    name: "search_accommodation_suggestions",
    channel: "travel",
  },
  FetchAllRates: {
    name: "fetch_all_rates",
    channel: "travel",
  },
  CreateQuoteForRate: {
    name: "create_quote_for_rate",
    channel: "travel",
  },
  CreateBooking: {
    name: "create_booking",
    channel: "travel",
  },
  GetBooking: {
    name: "get_booking",
    channel: "travel",
  },
  CancelBooking: {
    name: "cancel_booking",
    channel: "travel",
  },
  GetAccommodation: {
    name: "get_accommodation",
    channel: "travel",
  },
  ListLoyaltyProgrammes: {
    name: "list_loyalty_programmes",
    channel: "travel",
  },
  GetBrand: {
    name: "get_brand",
    channel: "travel",
  },
  ListBrands: {
    name: "list_brands",
    channel: "travel",
  },
  GetAirline: {
    name: "get_airline",
    channel: "travel",
  },
  ListAirlines: {
    name: "list_airlines",
    channel: "travel",
  },
  GetAircraft: {
    name: "get_aircraft",
    channel: "travel",
  },
  ListAircraft: {
    name: "list_aircraft",
    channel: "travel",
  },
  ListAirports: {
    name: "list_airports",
    channel: "travel",
  },
  GetAirport: {
    name: "get_airport",
    channel: "travel",
  },
  ListCities: {
    name: "list_cities",
    channel: "travel",
  },
  GetCity: {
    name: "get_city",
    channel: "travel",
  },
  ListPlaceSuggestions: {
    name: "list_place_suggestions",
    channel: "travel",
  },
  GetLoyaltyProgramme: {
    name: "get_loyalty_programme",
    channel: "travel",
  },
  CreateCustomerUser: {
    name: "create_customer_user",
    channel: "travel",
  },
  UpdateCustomerUser: {
    name: "update_customer_user",
    channel: "travel",
  },
  GetCustomerUser: {
    name: "get_customer_user",
    channel: "travel",
  },
  CreateComponentClientKey: {
    name: "create_component_client_key",
    channel: "travel",
  },
  ListWebhooks: {
    name: "list_webhooks",
    channel: "travel",
  },
  GetWebhookEvent: {
    name: "get_webhook_event",
    channel: "travel",
  },
  RetryWebhookEvent: {
    name: "retry_webhook_event",
    channel: "travel",
  },
  CreateWebhook: {
    name: "create_webhook",
    channel: "travel",
  },
  GetWebhook: {
    name: "get_webhook",
    channel: "travel",
  },
  DeleteWebhook: {
    name: "delete_webhook",
    channel: "travel",
  },
  PingWebhook: {
    name: "ping_webhook",
    channel: "travel",
  },
  GetWebhookDelivery: {
    name: "get_webhook_delivery",
    channel: "travel",
  },
  ListWebhookDeliveries: {
    name: "list_webhook_deliveries",
    channel: "travel",
  },
  CreateSession: {
    name: "create_session",
    channel: "travel",
  },
};
