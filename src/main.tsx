import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { AppProviders } from "./app/providers/AppProviders";
import { queryClient } from "./app/queryClient";
import { router } from "./app/router";
import "./styles.css";

async function enableApiMocking() {
  const { worker } = await import("./shared/mocks/browser");
  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
  });
}

await enableApiMocking();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element is missing");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} context={{ queryClient }} />
    </AppProviders>
  </StrictMode>,
);

