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
  CreateOfferRequest: {
    name: "Create Offer Request",
    channel: "travel",
  },
  CreatePartialOfferRequest: {
    name: "Create Partial Offer Request",
    channel: "travel",
  },
  GetPartialOfferRequest: {
    name: "Get Partial Offer Request",
    channel: "travel",
  },
  GetFullOfferFares: {
    name: "Get Full Offer Fares",
    channel: "travel",
  },
  ListOffers: {
    name: "List Offers",
    channel: "travel",
  },
  GetOffer: {
    name: "Get Offer",
    channel: "travel",
  },
  GetOfferRequest: {
    name: "Get Offer Request",
    channel: "travel",
  },
  UpdateOfferPassenger: {
    name: "Update Offer Passenger",
    channel: "travel",
  },
  CreateOrder: {
    name: "Create Order",
    channel: "travel",
  },
  ListOrderServices: {
    name: "List Order Services",
    channel: "travel",
  },
  AddOrderService: {
    name: "Add Order Service",
    channel: "travel",
  },
  GetOrder: {
    name: "Get Order",
    channel: "travel",
  },
  UpdateOrder: {
    name: "Update Order",
    channel: "travel",
  },
  ListOrders: {
    name: "List Orders",
    channel: "travel",
  },
  CreatePayment: {
    name: "Create Payment",
    channel: "travel",
  },
  GetSeatMaps: {
    name: "Get Seat Maps",
    channel: "travel",
  },
  ListOrderCancellations: {
    name: "List Order Cancellations",
    channel: "travel",
  },
  GetOrderCancellation: {
    name: "Get Order Cancellation",
    channel: "travel",
  },
  CreateOrderCancellation: {
    name: "Create Order Cancellation",
    channel: "travel",
  },
  ConfirmOrderCancellation: {
    name: "Confirm Order Cancellation",
    channel: "travel",
  },
  CreateOrderChangeRequest: {
    name: "Create Order Change Request",
    channel: "travel",
  },
  GetOrderChangeRequest: {
    name: "Get Order Change Request",
    channel: "travel",
  },
  ListOrderChangeOffers: {
    name: "List Order Change Offers",
    channel: "travel",
  },
  CreateBatchOfferRequest: {
    name: "Create Batch Offer Request",
    channel: "travel",
  },
  GetBatchOfferRequest: {
    name: "Get Batch Offer Request",
    channel: "travel",
  },
  ListAirlineInitiatedChanges: {
    name: "List Airline Initiated Changes",
    channel: "travel",
  },
  AcceptAirlineInitiatedChange: {
    name: "Accept Airline Initiated Change",
    channel: "travel",
  },
  UpdateAirlineInitiatedChange: {
    name: "Update Airline Initiated Change",
    channel: "travel",
  },
  SearchAccommodationSuggestions: {
    name: "Search Accommodation Suggestions",
    channel: "travel",
  },
  FetchAllRates: {
    name: "Fetch All Rates",
    channel: "travel",
  },
  CreateQuoteForRate: {
    name: "Create Quote For Rate",
    channel: "travel",
  },
  CreateBooking: {
    name: "Create Booking",
    channel: "travel",
  },
  GetBooking: {
    name: "Get Booking",
    channel: "travel",
  },
  CancelBooking: {
    name: "Cancel Booking",
    channel: "travel",
  },
  GetAccommodation: {
    name: "Get Accommodation",
    channel: "travel",
  },
  ListLoyaltyProgrammes: {
    name: "List Loyalty Programmes",
    channel: "travel",
  },
  GetBrand: {
    name: "Get Brand",
    channel: "travel",
  },
  ListBrands: {
    name: "List Brands",
    channel: "travel",
  },
  GetAirline: {
    name: "Get Airline",
    channel: "travel",
  },
  ListAirlines: {
    name: "List Airlines",
    channel: "travel",
  },
  GetAircraft: {
    name: "Get Aircraft",
    channel: "travel",
  },
  ListAircraft: {
    name: "List Aircraft",
    channel: "travel",
  },
  ListAirports: {
    name: "List Airports",
    channel: "travel",
  },
  GetAirport: {
    name: "Get Airport",
    channel: "travel",
  },
  ListCities: {
    name: "List Cities",
    channel: "travel",
  },
  GetCity: {
    name: "Get City",
    channel: "travel",
  },
  ListPlaceSuggestions: {
    name: "List Place Suggestions",
    channel: "travel",
  },
  GetLoyaltyProgramme: {
    name: "Get Loyalty Programme",
    channel: "travel",
  },
  SearchAccommodation: {
    name: "Search Accommodation",
    channel: "travel",
  },
};
