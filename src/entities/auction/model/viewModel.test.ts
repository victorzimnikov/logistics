import { describe, expect, it } from "vitest";
import type { AuctionListItem } from "@/shared/api/auctions/types";
import { initialAuctions, MOCK_AUCTION_UUIDS } from "@/shared/mocks/data";
import { getAuctionAction, mapAuctionToCard } from "./viewModel";

const auctionById = (id: string): AuctionListItem => {
  const auction = initialAuctions.find((item) => item.auction_uuid === id);
  if (!auction) throw new Error(`Нет фикстуры ${id}`);
  return structuredClone(auction);
};

describe("getAuctionAction", () => {
  it("предлагает поставить, если ставок ещё нет", () => {
    const auction = auctionById(MOCK_AUCTION_UUIDS.second);
    expect(getAuctionAction(auction)).toBe("makeBet");
  });

  it("предлагает изменить, если своя ставка уже есть", () => {
    const auction = auctionById(MOCK_AUCTION_UUIDS.first);
    expect(getAuctionAction(auction)).toBe("changeBet");
  });

  it("оставляет просмотр ставок, когда торги закрыты, но история открыта", () => {
    const auction = auctionById(MOCK_AUCTION_UUIDS.fifth);
    expect(getAuctionAction(auction)).toBe("viewBets");
  });

  it("блокирует действие, когда и ставки, и история недоступны", () => {
    const auction = auctionById(MOCK_AUCTION_UUIDS.fifth);
    auction.trading.hide_bets_history = true;
    expect(getAuctionAction(auction)).toBe("disabled");
  });
});

describe("mapAuctionToCard", () => {
  it("собирает маршрут и переводит справочные коды в подписи", () => {
    const card = mapAuctionToCard(auctionById(MOCK_AUCTION_UUIDS.first));

    expect(card.fromCity).toBe("Москва");
    expect(card.toCity).toBe("Санкт-Петербург");
    expect(card.type).toBe("На понижение");
    expect(card.status).toBe("Идут торги");
    expect(card.tradingStatus).toBe("Ставка перебита");
  });

  it("прячет цену и ставку за км, если организатор закрыл их", () => {
    const auction = auctionById(MOCK_AUCTION_UUIDS.first);
    auction.trading.no_view_cargo_price = true;

    const card = mapAuctionToCard(auction);

    expect(card.price).toBe("Цена скрыта");
    expect(card.pricePerKm).toBe("—");
  });

  it("не показывает шаг, если он не задан (фиксированная цена)", () => {
    const card = mapAuctionToCard(auctionById(MOCK_AUCTION_UUIDS.third));
    expect(card.step).toBeNull();
  });

  it("подставляет прочерк вместо неизвестного объёма", () => {
    const card = mapAuctionToCard(auctionById(MOCK_AUCTION_UUIDS.sixth));
    expect(card.cargoMeta).toContain("— м³");
  });
});
