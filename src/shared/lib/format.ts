const moneyFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
});

const compactDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const fullDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatMoney = (value: number | null, suffix = "₽"): string => {
  return value === null
    ? "Скрыто"
    : `${moneyFormatter.format(value)} ${suffix}`;
};

export const formatWeight = (value: number): string => {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value / 1000)} т`;
};

export const formatCompactDate = (value: string): string => {
  return compactDateFormatter.format(new Date(value)).replace(".", "");
};

export const formatFullDate = (value: string): string => {
  return fullDateFormatter.format(new Date(value));
};

export const formatTimeLeft = (value: string): string => {
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return "Торги завершены";

  const totalMinutes = Math.floor(diff / 60_000);
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days} д ${hours} ч`;
  return `${hours} ч ${minutes} мин`;
};
