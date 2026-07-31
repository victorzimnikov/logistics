import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type OpenApiDocument = {
  servers: Array<{ url: string }>;
  paths: Record<
    string,
    Record<
      string,
      {
        parameters?: Array<{ name: string; in: string }>;
        requestBody?: {
          required?: boolean;
          content: Record<string, { schema: { $ref: string } }>;
        };
        responses: Record<string, unknown>;
      }
    >
  >;
  components: {
    schemas: Record<
      string,
      {
        required?: string[];
        properties?: Record<string, unknown>;
      }
    >;
  };
};

const openApi = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "docs/openapi.auctions.v0.json"),
    "utf8",
  ),
) as OpenApiDocument;

describe("openapi.auctions.v0.json", () => {
  it("ограничивает интеграцию четырьмя поддерживаемыми операциями", () => {
    expect(Object.keys(openApi.paths)).toEqual([
      "/auctions/list",
      "/auctions/{auctionUuid}",
      "/auctions/{auctionUuid}/bets",
    ]);
    expect(Object.keys(openApi.paths["/auctions/{auctionUuid}/bets"])).toEqual([
      "get",
      "post",
    ]);
  });

  it("фиксирует /api/v1 как base URL", () => {
    expect(openApi.servers[0].url).toBe("/api/v1/");
  });

  it("AuctionListRequest плоский и не содержит filters", () => {
    const properties =
      openApi.components.schemas.AuctionListRequest.properties ?? {};
    expect(properties).toHaveProperty("cargo_num");
    expect(properties).toHaveProperty("current_price_from");
    expect(properties).toHaveProperty("load_date_from");
    expect(properties).not.toHaveProperty("filters");
  });

  it("GET bets документирует all и корневое поле bets", () => {
    const operation = openApi.paths["/auctions/{auctionUuid}/bets"].get;
    expect(operation.parameters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "all", in: "query" }),
      ]),
    );
    expect(openApi.components.schemas.BetListResponse.required).toContain(
      "bets",
    );
  });

  it("setBet принимает только price и возвращает 200", () => {
    const operation = openApi.paths["/auctions/{auctionUuid}/bets"].post;
    expect(operation.requestBody?.required).toBe(true);
    expect(
      Object.keys(openApi.components.schemas.SetBetRequest.properties ?? {}),
    ).toEqual(["price"]);
    expect(operation.responses).toHaveProperty("200");
    expect(operation.responses).not.toHaveProperty("201");
  });
});
