import type {
  AuctionStatus,
  AuctionType,
  UserTradingStatus,
} from "@/shared/api/auctions/types";

export const AUCTION_TYPE_LABELS: Record<AuctionType, string> = {
  Request: "Запрос ставок",
  Up: "На повышение",
  Down: "На понижение",
  FixPrice: "Фиксированная цена",
  Unknown: "Неизвестный тип",
};

export const AUCTION_STATUS_LABELS: Record<AuctionStatus, string> = {
  Planning: "Планирование",
  Auction: "Идут торги",
  DeterminateWinner: "Определение победителя",
  WaitDeal: "Ожидание сделки",
  InProgress: "В работе",
  Finished: "Завершён",
  Stopped: "Остановлен",
  Canceled: "Отменён",
  Unknown: "Неизвестный статус",
};

export const USER_TRADING_STATUS_LABELS: Record<UserTradingStatus, string> = {
  NotParticipating: "Не участвуете",
  Leading: "Ваша ставка лидирует",
  Losing: "Ставка перебита",
  OnPending: "На рассмотрении",
  Confirmed: "Подтверждено",
  ChoosingWinner: "Выбор победителя",
  Winner: "Вы победили",
  Accepted: "Ставка принята",
  Unknown: "Неизвестный статус",
};
