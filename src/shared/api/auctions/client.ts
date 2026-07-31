import {
  ApiContractError,
  mapAuctionDetailResponse,
  mapAuctionListResponse,
  mapBetListResponse,
} from "./adapters";
import type {
  ApiProblemDto,
  AuctionListRequestDto,
  SetBetRequestDto,
} from "./types";

const API_BASE_URL = "/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: ApiProblemDto,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const parsePayload = (text: string): unknown => {
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiContractError("сервер вернул невалидный JSON");
  }
};

const isApiProblem = (value: unknown): value is ApiProblemDto => {
  if (typeof value !== "object" || value === null) return false;
  const problem = value as Partial<ApiProblemDto>;
  return (
    typeof problem.code === "string" &&
    typeof problem.title === "string" &&
    typeof problem.message === "string"
  );
};

const request = async (
  path: string,
  options?: RequestInit,
  ignoreSuccessBody = false,
): Promise<unknown> => {
  const headers = new Headers(options?.headers);
  if (options?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const text = await response.text();

  if (!response.ok) {
    let payload: unknown;
    try {
      payload = parsePayload(text);
    } catch {
      payload = undefined;
    }
    const problem = isApiProblem(payload) ? payload : undefined;
    throw new ApiError(
      problem?.message ?? "Не удалось выполнить запрос",
      response.status,
      problem,
    );
  }

  return ignoreSuccessBody ? undefined : parsePayload(text);
};

const auctionPath = (auctionUuid: string): string =>
  `/auctions/${encodeURIComponent(auctionUuid)}`;

export const auctionsApi = {
  getList: async (body: AuctionListRequestDto = {}, signal?: AbortSignal) => {
    const payload = await request("/auctions/list", {
      method: "POST",
      body: JSON.stringify(body),
      signal,
    });
    return mapAuctionListResponse(payload);
  },

  getDetail: async (auctionUuid: string, signal?: AbortSignal) => {
    const payload = await request(auctionPath(auctionUuid), { signal });
    return mapAuctionDetailResponse(payload);
  },

  getBets: async (auctionUuid: string, all = false, signal?: AbortSignal) => {
    const suffix = all ? "?all=true" : "";
    const payload = await request(`${auctionPath(auctionUuid)}/bets${suffix}`, {
      signal,
    });
    return mapBetListResponse(payload, auctionUuid);
  },

  createBet: async (
    auctionUuid: string,
    body: SetBetRequestDto,
    signal?: AbortSignal,
  ): Promise<void> => {
    await request(
      `${auctionPath(auctionUuid)}/bets`,
      {
        method: "POST",
        body: JSON.stringify(body),
        signal,
      },
      true,
    );
  },
};
