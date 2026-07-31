import type { AuctionListItem } from "@/shared/api/auctions/types";
import {
  AUCTION_STATUS_LABELS,
  AUCTION_TYPE_LABELS,
  USER_TRADING_STATUS_LABELS,
} from "@/shared/config/labels";
import {
  formatCompactDate,
  formatMoney,
  formatWeight,
} from "@/shared/lib/format";




export type AuctionAction = "makeBet" | "changeBet" | "viewBets" | "disabled";

export type AuctionCardViewModel = {
  id: string;
  number: string;
  type: string;
  status: string;
  statusCode: AuctionListItem["status"];
  tradingStatus: string;
  tradingStatusCode: AuctionListItem["trading"]["user_status"];
  fromCity: string;
  toCity: string;
  loadingDate: string;
  unloadingDate: string;
  cargo: string;
  cargoMeta: string;
  price: string;
  pricePerKm: string;
  step: string | null;
  hasMyBet: boolean;
  action: AuctionAction;
};

export const getAuctionAction = (
  auction: AuctionListItem,
): AuctionAction => {
  if (auction.trading.can_set_bet) {
    return auction.trading.has_my_bet ? "changeBet" : "makeBet";
  }
  if (!auction.trading.hide_bets_history) return "viewBets";
  return "disabled";
};

export const mapAuctionToCard = (
  auction: AuctionListItem,
): AuctionCardViewModel => {
  return {
    id: auction.auction_uuid,
    number: auction.cargo_num,
    type: AUCTION_TYPE_LABELS[auction.auc_type],
    status: AUCTION_STATUS_LABELS[auction.status],
    statusCode: auction.status,
    tradingStatus: USER_TRADING_STATUS_LABELS[auction.trading.user_status],
    tradingStatusCode: auction.trading.user_status,
    fromCity: auction.route.loading.city.name,
    toCity: auction.route.unloading.city.name,
    loadingDate: formatCompactDate(auction.route.loading.date_from),
    unloadingDate: formatCompactDate(auction.route.unloading.date_from),
    cargo: auction.cargo.name,
    cargoMeta: `${formatWeight(auction.cargo.weight_kg)} · ${
      auction.cargo.volume_m3 ?? "—"
    } м³ · ${auction.cargo.body_type}`,
    price: auction.trading.no_view_cargo_price
      ? "Цена скрыта"
      : formatMoney(auction.price.current_price),
    pricePerKm: auction.trading.no_view_cargo_price
      ? "—"
      : `${formatMoney(auction.price.price_per_km)}/км`,
    step: auction.price.bet_step
      ? `Шаг ${formatMoney(auction.price.bet_step)}`
      : null,
    hasMyBet: auction.trading.has_my_bet,
    action: getAuctionAction(auction),
  };
};
