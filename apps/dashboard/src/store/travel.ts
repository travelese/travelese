import { create } from "zustand";

interface CreateOfferState {
  tripType: string;
  setTripType: (type: string) => void;
  travelClass: string;
  setTravelClass: (className: string) => void;
  from: string;
  setFrom: (from: string) => void;
  fromIATA: string;
  setFromIATA: (iata: string) => void;
  to: string;
  setTo: (to: string) => void;
  toIATA: string;
  setToIATA: (iata: string) => void;
  departureDate: Date | null;
  setDepartureDate: (date: Date | null) => void;
  returnDate: Date | null;
  setReturnDate: (date: Date | null) => void;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  updatePassengers: (
    type: keyof CreateOfferState["passengers"],
    increment: boolean,
  ) => void;
  baggage: {
    cabin: number;
    checked: number;
  };
  updateBaggage: (
    type: keyof CreateOfferState["baggage"],
    increment: boolean,
  ) => void;
}

interface SearchAccomodationState {
  destination: string;
  setDestination: (destination: string) => void;
  checkInDate: Date | null;
  setCheckInDate: (date: Date | null) => void;
  checkOutDate: Date | null;
  setCheckOutDate: (date: Date | null) => void;
  guests: {
    adults: number;
    children: number;
  };
  updateGuests: (
    type: keyof SearchAccomodationState["guests"],
    increment: boolean,
  ) => void;
}

interface TravelSearchState extends CreateOfferState, SearchAccomodationState {
  searchType: "flight" | "accommodation" | "both";
  setSearchType: (type: TravelSearchState["searchType"]) => void;
}

export const useTravelSearchStore = create<TravelSearchState>((set) => ({
  // Flight search state
  tripType: "return",
  setTripType: (type) => set({ tripType: type }),
  travelClass: "economy",
  setTravelClass: (className) => set({ travelClass: className }),
  from: "",
  setFrom: (from) => set({ from }),
  fromIATA: "",
  setFromIATA: (iata) => set({ fromIATA: iata }),
  to: "",
  setTo: (to) => set({ to }),
  toIATA: "",
  setToIATA: (iata) => set({ toIATA: iata }),
  departureDate: null,
  setDepartureDate: (date) => set({ departureDate: date }),
  returnDate: null,
  setReturnDate: (date) => set({ returnDate: date }),
  passengers: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  updatePassengers: (type, increment) =>
    set((state) => ({
      passengers: {
        ...state.passengers,
        [type]: increment
          ? state.passengers[type] + 1
          : Math.max(0, state.passengers[type] - 1),
      },
    })),
  baggage: {
    cabin: 0,
    checked: 0,
  },
  updateBaggage: (type, increment) =>
    set((state) => ({
      baggage: {
        ...state.baggage,
        [type]: increment
          ? state.baggage[type] + 1
          : Math.max(0, state.baggage[type] - 1),
      },
    })),

  // Accommodation search state
  destination: "",
  setDestination: (destination) => set({ destination }),
  checkInDate: null,
  setCheckInDate: (date) => set({ checkInDate: date }),
  checkOutDate: null,
  setCheckOutDate: (date) => set({ checkOutDate: date }),
  guests: {
    adults: 1,
    children: 0,
  },
  updateGuests: (type, increment) =>
    set((state) => ({
      guests: {
        ...state.guests,
        [type]: increment
          ? state.guests[type] + 1
          : Math.max(0, state.guests[type] - 1),
      },
    })),

  // Common state
  searchType: "flight",
  setSearchType: (type) => set({ searchType: type }),
}));
