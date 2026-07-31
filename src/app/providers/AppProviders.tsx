import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import { appTheme } from "../theme";
import { queryClient } from "../queryClient";
import { useUiStore } from "@/shared/model/uiStore";

export const AppProviders = ({ children }: PropsWithChildren) => {
  const toast = useUiStore((state) => state.toast);
  const closeToast = useUiStore((state) => state.closeToast);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        {children}
        <Snackbar
          open={toast.open}
          autoHideDuration={4200}
          onClose={closeToast}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={closeToast}
            severity={toast.severity}
            variant="filled"
            sx={{ width: "100%", borderRadius: 2.5, fontWeight: 700 }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
