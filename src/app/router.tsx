import {
  Navigate,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import {
  DEFAULT_AUCTION_SEARCH,
  parseAuctionSearch,
} from "@/features/auction-filters/model/searchParams";
import { AuctionsPage } from "@/pages/auctions/AuctionsPage";
import { AppShell } from "@/widgets/app-shell/AppShell";
import { AuctionDetailPage } from "@/pages/auction-detail/AuctionDetailPage";
import { PlaceBetPage } from "@/pages/place-bet/PlaceBetPage";

type RouterContext = {
  queryClient: QueryClient;
};

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: AppShell,
  notFoundComponent: () => (
    <Navigate to="/auctions" search={DEFAULT_AUCTION_SEARCH} replace />
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Navigate to="/auctions" search={DEFAULT_AUCTION_SEARCH} replace />
  ),
});

const auctionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auctions",
  validateSearch: parseAuctionSearch,
  component: AuctionsPage,
});

const auctionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auctions/$auctionUuid",
  component: AuctionDetailPage,
});

const placeBetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auctions/$auctionUuid/bet",
  component: PlaceBetPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  auctionsRoute,
  auctionDetailRoute,
  placeBetRoute,
]);

export const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined!,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 10_000,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
