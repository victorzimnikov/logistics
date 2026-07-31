import { delay, http, HttpResponse } from "msw";
import type {
  AuctionListRequestDto,
  SetBetRequestDto,
  ValidationProblemDto,
} from "@/shared/api/auctions/types";
import {
  createAuctionBet,
  getAuction,
  getAuctionBets,
  getAuctionList,
} from "./store";

const API_BASE_URL = "/api/v1";

const mockDelay = async (duration: number): Promise<void> => {
  if (import.meta.env.MODE !== "test") await delay(duration);
};

const problemJson = (body: Record<string, unknown>, status: number) =>
  HttpResponse.json(body, {
    status,
    headers: { "Content-Type": "application/problem+json" },
  });

const invalidJson = (): ValidationProblemDto => ({
  code: "validation_failed",
  title: "Ошибка валидации",
  message: "Тело запроса должно содержать валидный JSON.",
  trace_id: null,
  errors: [
    {
      field: "body",
      message: "Передан невалидный JSON.",
      code: "invalid_json",
    },
  ],
});

const readOptionalJson = async <T>(
  request: Request,
  fallback: T,
): Promise<T> => {
  const text = await request.text();
  return text ? (JSON.parse(text) as T) : fallback;
};

export const handlers = [
  http.post(`${API_BASE_URL}/auctions/list`, async ({ request }) => {
    await mockDelay(550);
    try {
      const body = await readOptionalJson<AuctionListRequestDto>(request, {});
      return HttpResponse.json(getAuctionList(body));
    } catch {
      return problemJson(invalidJson(), 422);
    }
  }),

  http.get(`${API_BASE_URL}/auctions/:auctionUuid`, async ({ params }) => {
    await mockDelay(350);
    const auction = getAuction(String(params.auctionUuid));
    if (!auction) {
      return problemJson(
        {
          code: "resource_not_found",
          title: "Не найдено",
          message: "Аукцион не найден",
          trace_id: null,
        },
        404,
      );
    }
    return HttpResponse.json(auction);
  }),

  http.get(
    `${API_BASE_URL}/auctions/:auctionUuid/bets`,
    async ({ params, request }) => {
      await mockDelay(400);
      const all = new URL(request.url).searchParams.get("all") === "true";
      const auctionBets = getAuctionBets(String(params.auctionUuid), all);
      if (!auctionBets) {
        return problemJson(
          {
            code: "resource_not_found",
            title: "Не найдено",
            message: "Аукцион не найден",
            trace_id: null,
          },
          404,
        );
      }
      return HttpResponse.json(auctionBets);
    },
  ),

  http.post(
    `${API_BASE_URL}/auctions/:auctionUuid/bets`,
    async ({ params, request }) => {
      await mockDelay(700);

      let body: SetBetRequestDto;
      try {
        body = await readOptionalJson<SetBetRequestDto>(request, {
          price: Number.NaN,
        });
      } catch {
        return problemJson(invalidJson(), 422);
      }

      const result = createAuctionBet(String(params.auctionUuid), body);
      if (!result.ok) {
        return problemJson(result.error, result.status);
      }
      return new HttpResponse(null, { status: 200 });
    },
  ),
];
