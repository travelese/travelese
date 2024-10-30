import { create } from "zustand";

interface TravelState {
  isTraveling: boolean;
  setTraveling: () => void;
}

export const useTravelStore = create<TravelState>()((set) => ({
  isTraveling: false,
  setTraveling: () => set((state) => ({ isTraveling: !state.isTraveling })),
}));
