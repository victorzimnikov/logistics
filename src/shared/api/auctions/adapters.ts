import type {
  AuctionDetail,
  AuctionListItem,
  AuctionListItemApiDto,
  AuctionListPage,
  AuctionListRoutePointDto,
  AuctionListResponseDto,
  AuctionShowResponseDto,
  Bet,
  BetItemDto,
  BetListResponseDto,
  BetsPage,
  RoutePoint,
  RoutePointApiDto,
} from "./types";

export class ApiContractError extends Error {
  constructor(message: string) {
    super(`Ответ API не соответствует OpenAPI: ${message}`);
    this.name = "ApiContractError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const requireRecord = (
  value: unknown,
  path: string,
): Record<string, unknown> => {
  if (!isRecord(value)) throw new ApiContractError(`${path} должен быть объектом`);
  return value;
};

const requireString = (value: unknown, path: string): string => {
  if (typeof value !== "string" || value.length === 0) {
    throw new ApiContractError(`${path} должен быть непустой строкой`);
  }
  return value;
};

const requireArray = (value: unknown, path: string): unknown[] => {
  if (!Array.isArray(value)) throw new ApiContractError(`${path} должен быть массивом`);
  return value;
};

const mapListRoutePoint = (
  point: AuctionListRoutePointDto | undefined,
  type: RoutePoint["type"],
  auctionUuid: string,
): RoutePoint => {
  const city = requireString(point?.city, `data.route.${type}.city`);
  const date = requireString(point?.date, `data.route.${type}.date`);

  return {
    uuid: `${auctionUuid}-${type.toLowerCase()}`,
    type,
    city: {
      uuid: String(point?.city_gc_id ?? city),
      name: city,
      gc_id: point?.city_gc_id,
    },
    address: point?.address ?? null,
    contact_name: null,
    contact_phone: null,
    date_from: date,
    date_to: date,
  };
};

const temperatureLabel = (
  from: number | null | undefined,
  to: number | null | undefined,
): string | null => {
  if (from == null && to == null) return null;
  if (from == null) return `до ${to} °C`;
  if (to == null) return `от ${from} °C`;
  return `${from}…${to} °C`;
};

const mapAuctionListItem = (dto: AuctionListItemApiDto): AuctionListItem => {
  const main = requireRecord(dto.main, "data[].main") as AuctionListItemApiDto["main"];
  const trading = requireRecord(
    dto.trading,
    "data[].trading",
  ) as AuctionListItemApiDto["trading"];
  const route = requireRecord(dto.route, "data[].route") as AuctionListItemApiDto["route"];
  const cargo = requireRecord(dto.cargo, "data[].cargo") as AuctionListItemApiDto["cargo"];
  const auctionUuid = requireString(main?.order_uid, "data[].main.order_uid");
  const price = trading?.price ?? null;
  const loading = mapListRoutePoint(route?.load, "LOADING", auctionUuid);
  const unloading = mapListRoutePoint(route?.unload, "UNLOADING", auctionUuid);

  return {
    auction_uuid: auctionUuid,
    cargo_num: requireString(main?.cargo_num, "data[].main.cargo_num"),
    auc_type: main?.auc_type ?? "Unknown",
    status: trading?.status ?? "Unknown",
    is_available: trading?.is_available ?? trading?.can_set_bet ?? false,
    distance_km: 0,
    route: {
      loading,
      unloading,
      points_count:
        (route?.load?.points_count ?? 1) + (route?.unload?.points_count ?? 1),
    },
    cargo: {
      name: cargo?.name ?? "Груз",
      weight_kg: (cargo?.weight ?? 0) * 1_000,
      volume_m3: cargo?.volume ?? null,
      body_type: cargo?.body_type ?? "Не указан",
      packages_count: null,
      temperature: temperatureLabel(cargo?.temp_from, cargo?.temp_to),
      comment: null,
    },
    price: {
      currency: "RUB",
      current_price: price?.current ?? null,
      available_price: price?.current ?? null,
      price_per_km: main?.price_per_km ?? null,
      min_price: null,
      max_price: null,
      bet_step: null,
      includes_vat: trading?.is_last_bet_with_vat ?? true,
    },
    trading: {
      can_set_bet: trading?.can_set_bet ?? false,
      hide_bets_history: false,
      hide_points_address_and_contacts:
        trading?.hide_points_address_and_contacts ?? false,
      no_view_cargo_price: price === null,
      user_status: trading?.status_mobile ?? "Unknown",
      has_my_bet: trading?.your?.bet ?? false,
      my_bet_price: trading?.your?.last_bet ?? null,
      ends_at: trading?.stop_time ?? trading?.start_time ?? "",
    },
  };
};

export const mapAuctionListResponse = (input: unknown): AuctionListPage => {
  const root = requireRecord(input, "корень") as AuctionListResponseDto;
  const data = requireArray(root.data, "data") as AuctionListItemApiDto[];
  const meta = requireRecord(root.meta, "meta") as NonNullable<
    AuctionListResponseDto["meta"]
  >;
  const page = meta.current_page ?? 1;
  const perPage = meta.per_page ?? data.length;
  const total = meta.total ?? data.length;

  return {
    items: data.map(mapAuctionListItem),
    pagination: {
      page,
      per_page: perPage,
      total,
      total_pages:
        meta.last_page ?? Math.max(1, Math.ceil(total / Math.max(perPage, 1))),
    },
  };
};

const mapDetailRoutePoint = (
  dto: RoutePointApiDto,
  auctionUuid: string,
  index: number,
): RoutePoint => {
  const type = dto.op_type === "Unloading" ? "UNLOADING" : "LOADING";
  const cityName = requireString(
    dto.location?.city_name,
    `routes[${index}].location.city_name`,
  );

  return {
    uuid: `${auctionUuid}-route-${dto.row_num ?? index + 1}`,
    type,
    city: {
      uuid: String(dto.location?.city_gc_id ?? cityName),
      name: cityName,
      gc_id: dto.location?.city_gc_id,
    },
    address: dto.location?.loading_address ?? null,
    contact_name: dto.contact?.name || null,
    contact_phone: dto.contact?.phone || null,
    date_from: requireString(dto.start_date, `routes[${index}].start_date`),
    date_to: dto.end_date ?? requireString(dto.start_date, `routes[${index}].start_date`),
  };
};

const loadingTypeLabel = (
  loadingTypes: AuctionShowResponseDto["cargo"]["loading_types"],
): string => {
  if (!loadingTypes) return "Не указан";
  const labels = [
    loadingTypes.side ? "Боковая" : null,
    loadingTypes.top ? "Верхняя" : null,
    loadingTypes.rear ? "Задняя" : null,
    loadingTypes.full ? "Полная" : null,
  ].filter(Boolean);
  return labels.join(", ") || "Не указан";
};

export const mapAuctionDetailResponse = (input: unknown): AuctionDetail => {
  const root = requireRecord(input, "корень") as unknown as AuctionShowResponseDto;
  const main = requireRecord(root.main, "main") as AuctionShowResponseDto["main"];
  const organizer = requireRecord(
    root.organizer,
    "organizer",
  ) as AuctionShowResponseDto["organizer"];
  const cargo = requireRecord(root.cargo, "cargo") as AuctionShowResponseDto["cargo"];
  const trading = requireRecord(
    root.trading,
    "trading",
  ) as AuctionShowResponseDto["trading"];
  const payment = requireRecord(
    root.payment,
    "payment",
  ) as AuctionShowResponseDto["payment"];
  requireRecord(root.assembly, "assembly");
  requireArray(root.contacts, "contacts");
  requireArray(root.admitted_organizations, "admitted_organizations");
  const routes = requireArray(root.routes, "routes") as RoutePointApiDto[];
  const auctionUuid = requireString(main.order_uid, "main.order_uid");
  const points = routes.map((point, index) =>
    mapDetailRoutePoint(point, auctionUuid, index),
  );
  const loading =
    points.find((point) => point.type === "LOADING") ?? points[0];
  const unloading =
    points.find((point) => point.type === "UNLOADING") ?? points.at(-1);

  if (!loading || !unloading) {
    throw new ApiContractError("routes должен содержать точки погрузки и выгрузки");
  }

  const sourceCargo =
    routes.find((point) => point.op_type === "Loading")?.cargo ??
    routes[0]?.cargo;
  const price = trading.price ?? {};
  const your = trading.your ?? {};
  const distance = cargo.distance ?? 0;

  return {
    auction_uuid: auctionUuid,
    cargo_num: requireString(main.cargo_num, "main.cargo_num"),
    auc_type: main.auc_type ?? "Unknown",
    status: trading.status ?? "Unknown",
    is_available: trading.can_set_bet ?? false,
    distance_km: distance,
    route: {
      loading,
      unloading,
      points_count: points.length,
    },
    points,
    cargo: {
      name: sourceCargo?.name ?? "Груз",
      weight_kg: Number(sourceCargo?.weight ?? 0) * 1_000,
      volume_m3:
        sourceCargo?.volume == null ? null : Number(sourceCargo.volume),
      body_type: cargo.body_type ?? "Не указан",
      packages_count: sourceCargo?.package_amount ?? null,
      temperature: temperatureLabel(cargo.temp_from, cargo.temp_to),
      comment:
        routes.find((point) => Boolean(point.comment))?.comment ?? null,
    },
    price: {
      currency: "RUB",
      current_price: price.current ?? null,
      available_price: price.available ?? null,
      price_per_km: price.price_per_km ?? null,
      min_price: price.min ?? null,
      max_price: price.max ?? null,
      bet_step: price.step ?? null,
      includes_vat: trading.is_last_bet_with_vat ?? true,
    },
    trading: {
      can_set_bet: trading.can_set_bet ?? false,
      hide_bets_history:
        root.hide_bets_history ?? trading.hide_bets_history ?? false,
      hide_points_address_and_contacts:
        trading.hide_points_address_and_contacts ?? false,
      no_view_cargo_price: trading.no_view_cargo_price ?? false,
      user_status: trading.status_mobile ?? "Unknown",
      has_my_bet: your.bet ?? false,
      my_bet_price: your.last_bet_with_vat ?? your.last_bet ?? null,
      ends_at: trading.stop_time ?? trading.start_time ?? "",
    },
    organizer: {
      name: organizer.organization_name ?? "Организатор",
      inn: organizer.organization_inn ?? "",
      rating: null,
    },
    vehicle_requirements: {
      body_type: cargo.body_type ?? cargo.car?.type ?? "Не указан",
      loading_type: loadingTypeLabel(cargo.loading_types),
      vehicles_count: cargo.truck_count ?? 1,
      vehicle_capacity_kg: (cargo.car?.weight ?? 0) * 1_000,
    },
    payment: {
      payment_delay_days: payment.delay ?? 0,
      payment_type: payment.form ?? "Не указан",
      prepayment_percent:
        payment.prepay == null ? null : Number(payment.prepay),
      notes: payment.condition ?? null,
    },
    created_at: main.created_at ?? main.cargo_date ?? "",
  };
};

const mapBet = (dto: BetItemDto, auctionUuid: string): Bet => {
  const cancellationReason = dto.cancel_reason?.trim() || null;

  return {
    bet_uuid: String(dto.id ?? `${auctionUuid}-${dto.created_at ?? "bet"}`),
    auction_uuid: auctionUuid,
    price_with_vat:
      dto.price_with_vat ?? dto.price_info?.price_with_vat ?? 0,
    price_without_vat:
      dto.price_no_vat ?? dto.price_info?.price_no_vat ?? 0,
    carrier: {
      name: dto.organization_name ?? "",
      inn: dto.organization_inn ?? "",
    },
    rating_place: dto.place ?? 0,
    is_winner: dto.is_win ?? false,
    is_cancelled: Boolean(dto.is_rejected || cancellationReason),
    cancellation_reason: cancellationReason,
    // OpenAPI does not expose an "is mine" marker in BetItem.
    is_mine: false,
    created_at: dto.created_at ?? "",
  };
};

export const mapBetListResponse = (
  input: unknown,
  auctionUuid: string,
): BetsPage => {
  const root = requireRecord(input, "корень") as unknown as BetListResponseDto;
  const bets = requireArray(root.bets, "bets") as BetItemDto[];
  const participants = new Set(
    bets.map((bet) => bet.organization_id ?? bet.subscriber_id).filter(Boolean),
  );

  return {
    items: bets.map((bet) => mapBet(bet, auctionUuid)),
    participants_count: participants.size,
  };
};
