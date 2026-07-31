import { describe, expect, it } from "vitest";
import type { AuctionSearch } from "./searchParams";
import {
  DEFAULT_AUCTION_SEARCH,
  buildAuctionListRequest,
  parseAuctionSearch,
} from "./searchParams";

describe("parseAuctionSearch", () => {
  it("возвращает значения по умолчанию для пустого поиска", () => {
    expect(parseAuctionSearch({})).toEqual(DEFAULT_AUCTION_SEARCH);
  });

  it("преобразует строковые значения из URL", () => {
    const search = parseAuctionSearch({
      page: "3",
      cargo_num: "  cargo-42  ",
      statuses: "2,6",
      is_available: "false",
      is_bidder: "true",
      price_from: "0",
      price_to: "150000",
    });

    expect(search).toMatchObject({
      page: 3,
      cargo_num: "cargo-42",
      statuses: [2, 6],
      is_available: false,
      is_bidder: true,
      price_from: 0,
      price_to: 150_000,
    });
  });

  it("заменяет некорректные значения безопасными значениями", () => {
    const search = parseAuctionSearch({
      page: "-2",
      statuses: "2,99",
      auc_type: "Unknown",
      is_available: "yes",
      price_from: "not-a-number",
    });

    expect(search.page).toBe(1);
    expect(search.statuses).toEqual([]);
    expect(search.auc_type).toBeUndefined();
    expect(search.is_available).toBeUndefined();
    expect(search.price_from).toBeUndefined();
  });
});

describe("buildAuctionListRequest", () => {
  it("собирает запрос без фильтров из значений по умолчанию", () => {
    expect(buildAuctionListRequest(DEFAULT_AUCTION_SEARCH)).toEqual({
      page: 1,
      per_page: 5,
    });
  });

  it("переносит заполненные поля в фильтры запроса", () => {
    const search: AuctionSearch = {
      page: 4,
      cargo_num: "cargo-42",
      statuses: [2, 6],
      auc_type: "Down",
      load_city: "Москва",
      unload_city: "Казань",
      loading_date_from: "2026-08-01",
      loading_date_to: "2026-08-05",
      is_available: true,
      is_bidder: true,
      price_from: 90_000,
      price_to: 150_000,
    };

    expect(buildAuctionListRequest(search)).toEqual({
      page: 4,
      per_page: 5,
      cargo_num: "cargo-42",
      statuses: [2, 6],
      auc_type: ["Down"],
      load_city: "Москва",
      unload_city: "Казань",
      load_date_from: "2026-08-01T00:00:00.000Z",
      load_date_to: "2026-08-05T23:59:59.999Z",
      is_available: true,
      is_bidder: true,
      current_price_from: 90_000,
      current_price_to: 150_000,
    });
  });

  it("сохраняет false и нулевую цену, но пропускает пустые поля", () => {
    const search: AuctionSearch = {
      page: 1,
      cargo_num: "",
      statuses: [],
      is_available: false,
      is_bidder: false,
      price_from: 0,
    };

    expect(buildAuctionListRequest(search)).toEqual({
      page: 1,
      per_page: 5,
      is_available: false,
      is_bidder: false,
      current_price_from: 0,
    });
  });
});
