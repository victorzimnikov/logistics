import { afterEach, describe, expect, it, vi } from "vitest";
import { formatMoney, formatTimeLeft, formatWeight } from "@/shared/lib/format";

// Intl вставляет неразрывные пробелы — для сравнения приводим к обычным.
const normalize = (value: string) => value.replace(/[\u00a0\u202f]/g, " ");

describe("formatMoney", () => {
  it("группирует разряды и добавляет суффикс", () => {
    expect(normalize(formatMoney(128000))).toBe("128 000 ₽");
  });

  it("округляет копейки до целых рублей", () => {
    expect(normalize(formatMoney(1234.56))).toBe("1 235 ₽");
  });

  it("отдаёт «Скрыто» вместо null — цену прячут закрытые торги", () => {
    expect(formatMoney(null)).toBe("Скрыто");
  });

  it("позволяет заменить суффикс", () => {
    expect(normalize(formatMoney(500, "₽/км"))).toBe("500 ₽/км");
  });
});

describe("formatWeight", () => {
  it("переводит килограммы в тонны", () => {
    expect(normalize(formatWeight(18500))).toBe("18,5 т");
  });

  it("округляет до одного знака", () => {
    expect(normalize(formatWeight(20449))).toBe("20,4 т");
  });
});

describe("formatTimeLeft", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const freezeAt = (iso: string) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(iso));
  };

  it("показывает дни и часы, когда осталось больше суток", () => {
    freezeAt("2026-08-01T00:00:00.000Z");
    expect(formatTimeLeft("2026-08-03T05:00:00.000Z")).toBe("2 д 5 ч");
  });

  it("переходит на часы и минуты внутри суток", () => {
    freezeAt("2026-08-01T00:00:00.000Z");
    expect(formatTimeLeft("2026-08-01T03:30:00.000Z")).toBe("3 ч 30 мин");
  });

  it("сообщает о завершении, если дедлайн уже прошёл", () => {
    freezeAt("2026-08-01T00:00:00.000Z");
    expect(formatTimeLeft("2026-07-31T23:59:00.000Z")).toBe("Торги завершены");
  });

  it("считает ровно наступивший дедлайн завершённым", () => {
    freezeAt("2026-08-01T00:00:00.000Z");
    expect(formatTimeLeft("2026-08-01T00:00:00.000Z")).toBe("Торги завершены");
  });
});
