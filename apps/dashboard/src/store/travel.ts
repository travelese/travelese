import { create } from "zustand";

interface TravelState {
  isTracking: boolean;
  setTracking: () => void;
}

export const useTravelStore = create<TravelState>()((set) => ({
  isTracking: false,
  setTracking: () => set((state) => ({ isTracking: !state.isTracking })),
}));
