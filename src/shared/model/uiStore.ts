import { create } from "zustand";

type ToastSeverity = "success" | "error" | "info";

type UiState = {
  filtersOpen: boolean;
  toast: {
    open: boolean;
    message: string;
    severity: ToastSeverity;
  };
  openFilters: () => void;
  closeFilters: () => void;
  showToast: (message: string, severity?: ToastSeverity) => void;
  closeToast: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  filtersOpen: false,
  toast: {
    open: false,
    message: "",
    severity: "info",
  },
  openFilters: () => set({ filtersOpen: true }),
  closeFilters: () => set({ filtersOpen: false }),
  showToast: (message, severity = "info") =>
    set({ toast: { open: true, message, severity } }),
  closeToast: () =>
    set((state) => ({ toast: { ...state.toast, open: false } })),
}));
