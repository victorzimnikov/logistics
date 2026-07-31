import type {
  ApiProblemDto,
  AuctionDetail,
  AuctionListItemApiDto,
  AuctionListRequestDto,
  AuctionListResponseDto,
  AuctionShowResponseDto,
  AuctionStatus,
  Bet,
  BetItemDto,
  BetListResponseDto,
  SetBetRequestDto,
  UserTradingStatus,
  ValidationProblemDto,
} from "@/shared/api/auctions/types";
import { initialAuctions, initialBets } from "./data";

let auctions = structuredClone(initialAuctions);
let bets = structuredClone(initialBets);

const auctionStatusIds: Record<AuctionStatus, number> = {
  Planning: 1,
  Auction: 2,
  DeterminateWinner: 3,
  WaitDeal: 4,
  InProgress: 5,
  Finished: 6,
  Stopped: 7,
  Canceled: 8,
  Unknown: 0,
};

const tradingStatusIds: Record<UserTradingStatus, number> = {
  NotParticipating: 1,
  Leading: 2,
  Losing: 3,
  Winner: 4,
  Confirmed: 5,
  OnPending: 6,
  ChoosingWinner: 7,
  Accepted: 8,
  Unknown: 0,
};

const contains = (value: string, search: string): boolean =>
  value.toLocaleLowerCase("ru").includes(search.toLocaleLowerCase("ru"));

const auctionNumericId = (auction: AuctionDetail): number =>
  auctions.findIndex((item) => item.auction_uuid === auction.auction_uuid) + 1;

const toListItem = (auction: AuctionDetail): AuctionListItemApiDto => ({
  main: {
    id: auctionNumericId(auction),
    cargo_num: auction.cargo_num,
    cargo_date: auction.created_at,
    auc_type: auction.auc_type,
    order_uid: auction.auction_uuid,
    created_at: auction.created_at,
    priority_sort: 0,
    is_assembly: false,
    price_per_km: auction.price.price_per_km,
  },
  organizer: {
    subscriber_id: 98,
    organization_id: 340,
    organization_name: auction.organizer.name,
    organization_inn: auction.organizer.inn,
    organization_kpp: "390601001",
    is_hide_organization: false,
  },
  route: {
    load: {
      city: auction.route.loading.city.name,
      address: auction.route.loading.address ?? "",
      date: auction.route.loading.date_from,
      city_gc_id: auction.route.loading.city.gc_id,
      points_count: 1,
    },
    unload: {
      city: auction.route.unloading.city.name,
      address: auction.route.unloading.address ?? "",
      date: auction.route.unloading.date_from,
      city_gc_id: auction.route.unloading.city.gc_id,
      points_count: 1,
    },
  },
  cargo: {
    name: auction.cargo.name,
    weight: auction.cargo.weight_kg / 1_000,
    volume: auction.cargo.volume_m3 ?? 0,
    body_type: auction.cargo.body_type,
    truck_count: auction.vehicle_requirements.vehicles_count,
    temp_from: null,
    temp_to: null,
  },
  trading: {
    status: auction.status,
    status_mobile: auction.trading.user_status,
    start_time: auction.created_at,
    stop_time: auction.trading.ends_at,
    can_set_bet: auction.trading.can_set_bet,
    hide_points_address_and_contacts:
      auction.trading.hide_points_address_and_contacts,
    is_bidder: auction.trading.has_my_bet,
    is_available: auction.is_available,
    price: auction.trading.no_view_cargo_price
      ? null
      : {
          start: auction.price.max_price ?? auction.price.current_price ?? 0,
          current: auction.price.current_price ?? 0,
          current_no_vat:
            auction.price.current_price == null
              ? 0
              : Math.round(auction.price.current_price / 1.2),
        },
    your: {
      bet: auction.trading.has_my_bet,
      last_bet: auction.trading.my_bet_price,
    },
    is_last_bet_with_vat: auction.price.includes_vat,
  },
  payment: {
    form: auction.payment.payment_type,
    currency_code: "643",
    consignor: null,
    consignee: null,
  },
});

const toRoutePoint = (
  auction: AuctionDetail,
  index: number,
): AuctionShowResponseDto["routes"][number] => {
  const point = auction.points[index];
  return {
    row_num: index + 1,
    op_type: point.type === "LOADING" ? "Loading" : "Unloading",
    start_date: point.date_from,
    end_date: point.date_to,
    comment: auction.cargo.comment,
    contractor: "",
    contractor_inn: "",
    location: {
      city_name: point.city.name,
      city_full_name: `${point.city.name}, Россия`,
      city_gc_id: point.city.gc_id,
      loading_address: point.address ?? "",
      lon: 0,
      lat: 0,
    },
    cargo: {
      name: auction.cargo.name,
      package_name: "",
      weight: (auction.cargo.weight_kg / 1_000).toFixed(3),
      volume: (auction.cargo.volume_m3 ?? 0).toFixed(3),
      length: "0",
      width: "0",
      height: "0",
      oversized: false,
      package_amount: auction.cargo.packages_count,
    },
    contact: {
      name: point.contact_name ?? "",
      phone: point.contact_phone ?? "",
    },
  };
};

const toDetailResponse = (auction: AuctionDetail): AuctionShowResponseDto => ({
  main: {
    id: auctionNumericId(auction),
    cargo_num: auction.cargo_num,
    cargo_date: auction.created_at,
    order_uid: auction.auction_uuid,
    auc_type: auction.auc_type,
    created_at: auction.created_at,
  },
  organizer: {
    subscriber_id: 98,
    subscriber_code: "12345",
    infobase_code: "RU_Cargo_01",
    organization_name: auction.organizer.name,
    organization_inn: auction.organizer.inn,
    organization_kpp: "390601001",
    organization_id: 340,
  },
  contacts: [],
  cargo: {
    price: String(auction.price.current_price ?? 0),
    currency: 643,
    is_international: false,
    distance: auction.distance_km,
    truck_count: auction.vehicle_requirements.vehicles_count,
    body_type: auction.vehicle_requirements.body_type,
    temp_from: null,
    temp_to: null,
    loading_types: {
      side: false,
      top: false,
      rear: true,
      full: false,
    },
    car: {
      type: auction.vehicle_requirements.body_type,
      weight: auction.vehicle_requirements.vehicle_capacity_kg / 1_000,
      volume: auction.cargo.volume_m3,
      width: null,
      length: null,
      height: null,
    },
  },
  trading: {
    status: auction.status,
    status_mobile: auction.trading.user_status,
    start_time: auction.created_at,
    stop_time: auction.trading.ends_at,
    can_set_bet: auction.trading.can_set_bet,
    hide_bets_history: auction.trading.hide_bets_history,
    no_view_cargo_price: auction.trading.no_view_cargo_price,
    hide_points_address_and_contacts:
      auction.trading.hide_points_address_and_contacts,
    is_bidder: auction.trading.has_my_bet,
    is_last_bet_with_vat: auction.price.includes_vat,
    price: {
      start: auction.price.max_price,
      start_no_vat:
        auction.price.max_price == null
          ? null
          : Math.round(auction.price.max_price / 1.2),
      current: auction.price.current_price,
      current_no_vat:
        auction.price.current_price == null
          ? null
          : Math.round(auction.price.current_price / 1.2),
      available: auction.price.available_price,
      available_no_vat:
        auction.price.available_price == null
          ? null
          : Math.round(auction.price.available_price / 1.2),
      min: auction.price.min_price,
      min_no_vat:
        auction.price.min_price == null
          ? null
          : Math.round(auction.price.min_price / 1.2),
      max: auction.price.max_price,
      max_no_vat:
        auction.price.max_price == null
          ? null
          : Math.round(auction.price.max_price / 1.2),
      step: auction.price.bet_step,
      step_no_vat:
        auction.price.bet_step == null
          ? null
          : Math.round(auction.price.bet_step / 1.2),
      price_per_km: auction.price.price_per_km ?? 0,
    },
    your: {
      bet: auction.trading.has_my_bet,
      last_bet: auction.trading.my_bet_price,
      last_bet_with_vat: auction.trading.my_bet_price,
      win: auction.trading.user_status === "Winner",
    },
  },
  payment: {
    condition: auction.payment.notes,
    condition_predefined: null,
    form: auction.payment.payment_type,
    delay: auction.payment.payment_delay_days,
    delay_type: "CalendarDays",
    currency_code: "643",
    prepay:
      auction.payment.prepayment_percent == null
        ? null
        : String(auction.payment.prepayment_percent),
  },
  assembly: {
    num: null,
    date: null,
  },
  routes: auction.points.map((_, index) => toRoutePoint(auction, index)),
  admitted_organizations: [],
  hide_bets_history: auction.trading.hide_bets_history,
});

const toBetItem = (bet: Bet, index: number): BetItemDto => ({
  id: index + 1,
  created_at: bet.created_at,
  auction_id: 1,
  subscriber_id: bet.is_mine ? 13 : 14 + index,
  contact_name: "",
  contact_phone: "",
  price_with_vat: bet.price_with_vat,
  price_no_vat: bet.price_without_vat,
  organization_id: bet.is_mine ? 14 : 20 + index,
  organization_inn: bet.carrier.inn,
  organization_name: bet.carrier.name,
  transporter_comment: null,
  is_rejected: bet.is_cancelled,
  is_counter: false,
  place: bet.rating_place,
  is_win: bet.is_winner,
  run_number: 0,
  cancel_reason: bet.cancellation_reason ?? "",
  price_info: {
    price_with_vat: bet.price_with_vat,
    price_no_vat: bet.price_without_vat,
    payment_type: "Безналичная с НДС",
    vat_rate: "20",
  },
});

const isWithinDates = (
  value: string,
  from?: string,
  to?: string,
): boolean => {
  const timestamp = Date.parse(value);
  if (from && timestamp < Date.parse(from)) return false;
  if (to && timestamp > Date.parse(to)) return false;
  return true;
};

const matchesListRequest = (
  auction: AuctionDetail,
  request: AuctionListRequestDto,
): boolean => {
  if (request.cargo_num && !contains(auction.cargo_num, request.cargo_num)) {
    return false;
  }
  if (
    request.status?.length &&
    !request.status.includes(auction.trading.user_status)
  ) {
    return false;
  }
  if (
    request.mobile_statuses?.length &&
    !request.mobile_statuses.includes(
      tradingStatusIds[auction.trading.user_status],
    )
  ) {
    return false;
  }
  if (
    request.statuses?.length &&
    !request.statuses.includes(auctionStatusIds[auction.status])
  ) {
    return false;
  }
  if (
    request.auc_type?.length &&
    (auction.auc_type === "Unknown" ||
      !request.auc_type.includes(auction.auc_type))
  ) {
    return false;
  }
  if (
    request.load_city &&
    !contains(auction.route.loading.city.name, request.load_city)
  ) {
    return false;
  }
  if (
    request.load_gc_id !== undefined &&
    auction.route.loading.city.gc_id !== request.load_gc_id
  ) {
    return false;
  }
  if (
    request.unload_city &&
    !contains(auction.route.unloading.city.name, request.unload_city)
  ) {
    return false;
  }
  if (
    request.unload_gc_id !== undefined &&
    auction.route.unloading.city.gc_id !== request.unload_gc_id
  ) {
    return false;
  }
  if (
    !isWithinDates(
      auction.route.loading.date_from,
      request.load_date_from,
      request.load_date_to,
    )
  ) {
    return false;
  }
  if (
    !isWithinDates(
      auction.route.unloading.date_from,
      request.unload_date_from,
      request.unload_date_to,
    )
  ) {
    return false;
  }
  if (
    !isWithinDates(
      auction.created_at,
      request.create_date_from,
      request.create_date_to,
    )
  ) {
    return false;
  }
  if (
    !isWithinDates(
      auction.created_at,
      request.start_time_from,
      request.start_time_to,
    )
  ) {
    return false;
  }
  if (
    !isWithinDates(
      auction.trading.ends_at,
      request.stop_time_from,
      request.stop_time_to,
    )
  ) {
    return false;
  }
  if (
    request.is_available !== undefined &&
    auction.is_available !== request.is_available
  ) {
    return false;
  }
  if (
    request.is_bidder !== undefined &&
    auction.trading.has_my_bet !== request.is_bidder
  ) {
    return false;
  }
  if (
    request.current_price_from != null &&
    (auction.price.current_price == null ||
      auction.price.current_price < request.current_price_from)
  ) {
    return false;
  }
  if (
    request.current_price_to != null &&
    (auction.price.current_price == null ||
      auction.price.current_price > request.current_price_to)
  ) {
    return false;
  }
  if (
    request.price_per_km_from != null &&
    (auction.price.price_per_km == null ||
      auction.price.price_per_km < request.price_per_km_from)
  ) {
    return false;
  }
  if (
    request.price_per_km_to != null &&
    (auction.price.price_per_km == null ||
      auction.price.price_per_km > request.price_per_km_to)
  ) {
    return false;
  }
  if (
    request.weight_from !== undefined &&
    auction.cargo.weight_kg / 1_000 < request.weight_from
  ) {
    return false;
  }
  if (
    request.weight_to !== undefined &&
    auction.cargo.weight_kg / 1_000 > request.weight_to
  ) {
    return false;
  }
  if (
    request.volume_from !== undefined &&
    (auction.cargo.volume_m3 == null ||
      auction.cargo.volume_m3 < request.volume_from)
  ) {
    return false;
  }
  if (
    request.volume_to !== undefined &&
    (auction.cargo.volume_m3 == null ||
      auction.cargo.volume_m3 > request.volume_to)
  ) {
    return false;
  }
  if (
    request.body_types?.length &&
    !request.body_types.some((type) => contains(auction.cargo.body_type, type))
  ) {
    return false;
  }
  if (
    request.form_type &&
    !contains(auction.payment.payment_type, request.form_type)
  ) {
    return false;
  }
  if (
    request.is_international_shipment === true
  ) {
    return false;
  }
  if (
    request.customer &&
    !contains(auction.organizer.name, request.customer) &&
    !contains(auction.organizer.inn, request.customer)
  ) {
    return false;
  }
  if (
    request.customer_ids?.length &&
    !request.customer_ids.includes(340)
  ) {
    return false;
  }
  if (request.contractor) return false;
  if (request.is_favorite === true) return false;
  if (
    request.auction_ids?.length &&
    !request.auction_ids.includes(auctionNumericId(auction))
  ) {
    return false;
  }
  return true;
};

const sortAuctions = (
  source: AuctionDetail[],
  request: AuctionListRequestDto,
): AuctionDetail[] => {
  const result = [...source];
  const sortEntries = Object.entries(request.sort ?? {});

  if (sortEntries.length === 0) {
    return result.sort((left, right) => {
      const direction = request.is_oldest ? 1 : -1;
      return (
        direction *
        (Date.parse(left.created_at) - Date.parse(right.created_at))
      );
    });
  }

  return result.sort((left, right) => {
    for (const [field, direction] of sortEntries) {
      const multiplier = direction === "asc" ? 1 : -1;
      const leftValue =
        field === "start_time"
          ? Date.parse(left.created_at)
          : field === "price_per_km"
            ? left.price.price_per_km ?? 0
            : left.price.current_price ?? 0;
      const rightValue =
        field === "start_time"
          ? Date.parse(right.created_at)
          : field === "price_per_km"
            ? right.price.price_per_km ?? 0
            : right.price.current_price ?? 0;
      if (leftValue !== rightValue) return multiplier * (leftValue - rightValue);
    }
    return 0;
  });
};

export const getAuctionList = (
  request: AuctionListRequestDto = {},
): AuctionListResponseDto => {
  const page = request.page ?? 1;
  const perPage = request.per_page ?? 20;
  const filtered = sortAuctions(
    auctions.filter((auction) => matchesListRequest(auction, request)),
    request,
  );
  const start = (page - 1) * perPage;
  const data = filtered.slice(start, start + perPage).map(toListItem);
  const total = filtered.length;

  return {
    data,
    meta: {
      current_page: page,
      from: data.length === 0 ? 0 : start + 1,
      last_page: Math.max(1, Math.ceil(total / perPage)),
      per_page: perPage,
      to: start + data.length,
      total,
    },
  };
};

export const getAuction = (
  auctionUuid: string,
): AuctionShowResponseDto | undefined => {
  const auction = auctions.find((item) => item.auction_uuid === auctionUuid);
  return auction ? toDetailResponse(structuredClone(auction)) : undefined;
};

export const getAuctionBets = (
  auctionUuid: string,
  all = false,
): BetListResponseDto | undefined => {
  const auction = auctions.find((item) => item.auction_uuid === auctionUuid);
  if (!auction) return undefined;
  const auctionBets = structuredClone(bets[auctionUuid] ?? []);
  const visible = all
    ? auctionBets
    : auctionBets.filter((bet) => !bet.is_cancelled);
  return { bets: visible.map(toBetItem) };
};

const validationError = (
  field: string,
  message: string,
): ValidationProblemDto => ({
  code: "validation_failed",
  title: "Ошибка валидации",
  message: "Запрос содержит некорректные поля.",
  trace_id: null,
  errors: [{ field, message, code: "invalid_value" }],
});

const notFoundError = (): ApiProblemDto => ({
  code: "resource_not_found",
  title: "Не найдено",
  message: "Аукцион не найден",
  trace_id: null,
});

export const createAuctionBet = (
  auctionUuid: string,
  request: SetBetRequestDto,
):
  | { ok: true }
  | { ok: false; status: number; error: ApiProblemDto } => {
  const auction = auctions.find((item) => item.auction_uuid === auctionUuid);
  if (!auction) {
    return { ok: false, status: 404, error: notFoundError() };
  }
  if (!auction.trading.can_set_bet) {
    return {
      ok: false,
      status: 422,
      error: validationError("price", "Ставки для этого аукциона недоступны"),
    };
  }
  if (!Number.isFinite(request.price) || request.price <= 0) {
    return {
      ok: false,
      status: 422,
      error: validationError("price", "Цена должна быть больше 0"),
    };
  }
  if (
    auction.price.min_price !== null &&
    request.price < auction.price.min_price
  ) {
    return {
      ok: false,
      status: 422,
      error: validationError(
        "price",
        `Цена ниже минимальной: ${auction.price.min_price}`,
      ),
    };
  }
  if (
    auction.price.max_price !== null &&
    request.price > auction.price.max_price
  ) {
    return {
      ok: false,
      status: 422,
      error: validationError(
        "price",
        `Цена выше максимальной: ${auction.price.max_price}`,
      ),
    };
  }
  if (
    auction.price.bet_step !== null &&
    auction.price.min_price !== null &&
    (request.price - auction.price.min_price) % auction.price.bet_step !== 0
  ) {
    return {
      ok: false,
      status: 422,
      error: validationError(
        "price",
        `Цена не соответствует шагу: ${auction.price.bet_step}`,
      ),
    };
  }

  const auctionBets = bets[auctionUuid] ?? [];
  for (const bet of auctionBets) {
    if (bet.is_mine && !bet.is_cancelled) {
      bet.is_cancelled = true;
      bet.cancellation_reason = "Ставка изменена";
    }
  }

  const newBet: Bet = {
    bet_uuid: `bet-${auctionUuid}-${Date.now()}`,
    auction_uuid: auctionUuid,
    price_with_vat: request.price,
    price_without_vat: Math.round(request.price / 1.2),
    carrier: { name: "ООО «Вектор Карго»", inn: "3906123901" },
    rating_place: 1,
    is_winner: false,
    is_cancelled: false,
    cancellation_reason: null,
    is_mine: true,
    created_at: new Date().toISOString(),
  };

  const activeBets = [
    ...auctionBets.filter((bet) => !bet.is_cancelled),
    newBet,
  ];
  const descending = auction.auc_type === "Up";
  activeBets.sort((left, right) =>
    descending
      ? right.price_with_vat - left.price_with_vat
      : left.price_with_vat - right.price_with_vat,
  );
  activeBets.forEach((bet, index) => {
    bet.rating_place = index + 1;
  });
  bets[auctionUuid] = [newBet, ...auctionBets];

  auction.price.current_price = request.price;
  auction.price.price_per_km =
    auction.distance_km > 0
      ? Math.round(request.price / auction.distance_km)
      : 0;
  auction.price.available_price =
    auction.price.bet_step === null
      ? request.price
      : auction.auc_type === "Up"
        ? request.price + auction.price.bet_step
        : request.price - auction.price.bet_step;
  auction.trading.has_my_bet = true;
  auction.trading.my_bet_price = request.price;
  auction.trading.user_status =
    newBet.rating_place === 1 ? "Leading" : "Losing";
  return { ok: true };
};

export const resetMockStore = (): void => {
  auctions = structuredClone(initialAuctions);
  bets = structuredClone(initialBets);
};
