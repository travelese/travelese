import { create } from "zustand";

interface AssistantState {
  isOpen: boolean;
  isMaximized: boolean;
  message?: string;
  setOpen: (message?: string) => void;
  setMaximized: (maximized: boolean) => void;
}

export const useAssistantStore = create<AssistantState>()((set) => ({
  isOpen: false,
  isMaximized: false,
  message: undefined,
  setOpen: (message) => set((state) => ({ isOpen: !state.isOpen, message })),
  setMaximized: (maximized) => set({ isMaximized: maximized }),
}));
