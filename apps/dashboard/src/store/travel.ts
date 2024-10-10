import { create } from "zustand";

interface TravelSearchState {
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
  updatePassengers: (type: keyof typeof passengers, increment: boolean) => void;
  baggage: {
    cabin: number;
    checked: number;
  };
  updateBaggage: (type: keyof typeof baggage, increment: boolean) => void;
  checkAccommodation: boolean;
  setCheckAccommodation: (check: boolean) => void;
}

export const useTravelSearchStore = create<TravelSearchState>((set) => ({
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
  checkAccommodation: false,
  setCheckAccommodation: (check) => set({ checkAccommodation: check }),
}));
