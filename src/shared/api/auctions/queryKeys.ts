import type { AuctionListRequestDto } from "./types";

export const auctionQueryKeys = {
  all: ["auctions"] as const,
  lists: () => [...auctionQueryKeys.all, "list"] as const,
  list: (request: AuctionListRequestDto) =>
    [...auctionQueryKeys.lists(), request] as const,
  details: () => [...auctionQueryKeys.all, "detail"] as const,
  detail: (auctionUuid: string) =>
    [...auctionQueryKeys.details(), auctionUuid] as const,
  betsRoot: (auctionUuid: string) =>
    [...auctionQueryKeys.all, "bets", auctionUuid] as const,
  bets: (auctionUuid: string, all = false) =>
    [...auctionQueryKeys.betsRoot(auctionUuid), { all }] as const,
};
