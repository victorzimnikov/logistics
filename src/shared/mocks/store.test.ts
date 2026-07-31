import { beforeEach, describe, expect, it } from "vitest";
import type { AuctionListRequestDto } from "@/shared/api/auctions/types";
import { MOCK_AUCTION_UUIDS } from "./data";
import {
  createAuctionBet,
  getAuction,
  getAuctionBets,
  getAuctionList,
  resetMockStore,
} from "./store";

const list = (request: AuctionListRequestDto = {}) =>
  getAuctionList({ page: 1, per_page: 20, ...request });

beforeEach(() => {
  resetMockStore();
});

describe("getAuctionList", () => {
  it("принимает необязательное тело и возвращает data/meta", () => {
    const response = getAuctionList();
    expect(response.data?.length).toBeGreaterThan(0);
    expect(response.meta).toMatchObject({
      current_page: 1,
      per_page: 20,
      total: 8,
    });
  });

  it("ищет по номеру заявки без учета регистра", () => {
    const response = list({ cargo_num: "gr-24081" });
    expect(response.data).toHaveLength(1);
    expect(response.data?.[0].main?.cargo_num).toBe("GR-24081");
  });

  it("фильтрует по числовому статусу аукциона", () => {
    const response = list({ statuses: [6] });
    expect(response.data?.length).toBeGreaterThan(0);
    expect(
      response.data?.every((item) => item.trading?.status === "Finished"),
    ).toBe(true);
  });

  it("фильтрует по контрактному enum типа аукциона", () => {
    const response = list({ auc_type: ["Down"] });
    expect(response.data?.length).toBeGreaterThan(0);
    expect(response.data?.every((item) => item.main?.auc_type === "Down")).toBe(
      true,
    );
  });

  it("фильтрует по названию города погрузки", () => {
    const response = list({ load_city: "Москва" });
    expect(
      response.data?.every((item) => item.route?.load?.city === "Москва"),
    ).toBe(true);
  });

  it("использует current_price_from/current_price_to", () => {
    const response = list({
      current_price_from: 150_000,
      current_price_to: 200_000,
    });
    expect(
      response.data?.every((item) => {
        const price = item.trading?.price?.current;
        return price != null && price >= 150_000 && price <= 200_000;
      }),
    ).toBe(true);
  });

  it("возвращает контрактные метаданные пагинации", () => {
    const total = list().meta?.total ?? 0;
    const response = getAuctionList({ page: 1, per_page: 2 });
    expect(response.data).toHaveLength(2);
    expect(response.meta?.total).toBe(total);
    expect(response.meta?.last_page).toBe(Math.ceil(total / 2));
  });
});

describe("getAuction", () => {
  it("возвращает обязательные секции detail и валидный UUID", () => {
    const response = getAuction(MOCK_AUCTION_UUIDS.first);
    expect(response).toMatchObject({
      main: { order_uid: MOCK_AUCTION_UUIDS.first },
      organizer: expect.any(Object),
      contacts: expect.any(Array),
      cargo: expect.any(Object),
      trading: expect.any(Object),
      payment: expect.any(Object),
      assembly: expect.any(Object),
      routes: expect.any(Array),
      admitted_organizations: expect.any(Array),
    });
  });
});

describe("getAuctionBets", () => {
  it("возвращает корневое поле bets", () => {
    const response = getAuctionBets(MOCK_AUCTION_UUIDS.first);
    expect(response).toEqual({ bets: expect.any(Array) });
  });

  it("all=true включает отмененные ставки", () => {
    createAuctionBet(MOCK_AUCTION_UUIDS.first, { price: 120_000 });
    const active = getAuctionBets(MOCK_AUCTION_UUIDS.first, false)?.bets ?? [];
    const all = getAuctionBets(MOCK_AUCTION_UUIDS.first, true)?.bets ?? [];
    expect(all.length).toBeGreaterThan(active.length);
    expect(all.some((bet) => bet.cancel_reason)).toBe(true);
  });
});

describe("createAuctionBet", () => {
  it("отклоняет ставку на закрытый аукцион", () => {
    const result = createAuctionBet(MOCK_AUCTION_UUIDS.fifth, {
      price: 150_000,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(422);
      expect(result.error.code).toBe("validation_failed");
      expect(result.error.title).toBe("Ошибка валидации");
    }
  });

  it("отклоняет ставку, не кратную шагу", () => {
    const result = createAuctionBet(MOCK_AUCTION_UUIDS.first, {
      price: 91_500,
    });
    expect(result.ok).toBe(false);
    if (!result.ok && "errors" in result.error) {
      expect(result.error.errors[0].field).toBe("price");
    }
  });

  it("отвечает ProblemDetail 404 для неизвестного UUID", () => {
    const result = createAuctionBet("00000000-0000-4000-8000-000000000099", {
      price: 100_000,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
      expect(result.error).toMatchObject({
        code: "resource_not_found",
        title: "Не найдено",
      });
    }
  });

  it("принимает только price и обновляет detail", () => {
    const result = createAuctionBet(MOCK_AUCTION_UUIDS.second, {
      price: 130_000,
    });
    expect(result).toEqual({ ok: true });

    const detail = getAuction(MOCK_AUCTION_UUIDS.second);
    expect(detail?.trading.price?.current).toBe(130_000);
    expect(detail?.trading.your?.bet).toBe(true);
    expect(detail?.trading.your?.last_bet_with_vat).toBe(130_000);
  });

  it("resetMockStore откатывает mutation", () => {
    createAuctionBet(MOCK_AUCTION_UUIDS.second, { price: 130_000 });
    resetMockStore();
    expect(getAuction(MOCK_AUCTION_UUIDS.second)?.trading.your?.bet).toBe(
      false,
    );
  });
});
