import { create } from "zustand";
import { Flight } from "../utils/get-flights";

interface UsePlanesStore {
  selectedFlight: Flight | null;
  mapReady: boolean;
}

export const usePlanesStore = create<UsePlanesStore>((set) => ({
  selectedFlight: null,
  mapReady: false,
}));
