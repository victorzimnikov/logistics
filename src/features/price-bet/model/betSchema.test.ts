import { describe, expect, it } from "vitest";
import type { Price } from "@/shared/api/auctions/types";
import { createBetSchema } from "./betSchema";

const price = (overrides: Partial<Price> = {}): Price => ({
  currency: "RUB",
  current_price: 128_000,
  available_price: 126_000,
  price_per_km: 180,
  min_price: 90_000,
  max_price: 180_000,
  bet_step: 2_000,
  includes_vat: true,
  ...overrides,
});

const validate = (value: unknown, priceDto: Price = price()) =>
  createBetSchema(priceDto).safeParse({
    price: value,
  });

const firstError = (result: ReturnType<typeof validate>) =>
  result.success ? null : result.error.issues[0].message;

describe("createBetSchema", () => {
  it("принимает сумму, кратную шагу от минимума", () => {
    expect(validate(100_000).success).toBe(true);
  });

  it("отклоняет сумму ниже минимума", () => {
    expect(firstError(validate(80_000))).toContain("Минимальная ставка");
  });

  it("отклоняет сумму выше максимума", () => {
    expect(firstError(validate(200_000))).toContain("Максимальная ставка");
  });

  it("отклоняет сумму, не попадающую в шаг", () => {
    expect(firstError(validate(91_500))).toContain("шагу");
  });

  it("не проверяет шаг, если он не задан", () => {
    expect(validate(91_500, price({ bet_step: null })).success).toBe(true);
  });

  it("требует положительную цену", () => {
    expect(firstError(validate(0, price({ min_price: null })))).toContain(
      "больше 0",
    );
  });

  it("приводит строку из инпута к числу", () => {
    expect(validate("100000").success).toBe(true);
  });
});
