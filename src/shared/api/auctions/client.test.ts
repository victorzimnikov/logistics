import { beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_AUCTION_UUIDS } from "@/shared/mocks/data";
import {
  getAuction,
  getAuctionBets,
  getAuctionList,
  resetMockStore,
} from "@/shared/mocks/store";
import { auctionsApi } from "./client";

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  resetMockStore();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("auctionsApi", () => {
  it("POST /auctions/list отправляет плоский request и адаптирует data/meta", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(getAuctionList({ cargo_num: "GR-24081" })),
    );

    const result = await auctionsApi.getList({
      page: 1,
      per_page: 5,
      cargo_num: "GR-24081",
      statuses: [2],
      auc_type: ["Down"],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/auctions/list",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          page: 1,
          per_page: 5,
          cargo_num: "GR-24081",
          statuses: [2],
          auc_type: ["Down"],
        }),
      }),
    );
    expect(result.items[0]).toMatchObject({
      auction_uuid: MOCK_AUCTION_UUIDS.first,
      auc_type: "Down",
      status: "Auction",
    });
    expect(result.pagination.total).toBe(1);
  });

  it("GET detail использует UUID и адаптирует обязательные секции", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(getAuction(MOCK_AUCTION_UUIDS.first)),
    );

    const result = await auctionsApi.getDetail(MOCK_AUCTION_UUIDS.first);

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/v1/auctions/${MOCK_AUCTION_UUIDS.first}`,
      expect.any(Object),
    );
    expect(result).toMatchObject({
      auction_uuid: MOCK_AUCTION_UUIDS.first,
      cargo_num: "GR-24081",
      distance_km: 710,
    });
    expect(result.points).toHaveLength(2);
  });

  it("GET bets передает all и адаптирует корневое поле bets", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(getAuctionBets(MOCK_AUCTION_UUIDS.first, true)),
    );

    const result = await auctionsApi.getBets(MOCK_AUCTION_UUIDS.first, true);

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/v1/auctions/${MOCK_AUCTION_UUIDS.first}/bets?all=true`,
      expect.any(Object),
    );
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].carrier.name).toBe("ООО «ТрансПуть»");
  });

  it("POST bet отправляет только price и принимает пустой 200", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));

    await expect(
      auctionsApi.createBet(MOCK_AUCTION_UUIDS.second, {
        price: 130_000,
      }),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/v1/auctions/${MOCK_AUCTION_UUIDS.second}/bets`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ price: 130_000 }),
      }),
    );
  });

  it("разбирает application/problem+json", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          code: "validation_failed",
          title: "Ошибка валидации",
          message: "Некорректная цена",
          errors: [
            {
              field: "price",
              message: "Цена должна быть больше 0",
              code: "invalid_value",
            },
          ],
        },
        422,
      ),
    );

    await expect(
      auctionsApi.createBet(MOCK_AUCTION_UUIDS.second, { price: 0 }),
    ).rejects.toMatchObject({
      status: 422,
      message: "Некорректная цена",
    });
  });
});
