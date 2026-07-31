import type {
  AuctionDetail,
  AuctionStatus,
  AuctionType,
  Bet,
  Cargo,
  RoutePoint,
  UserTradingStatus,
} from "@/shared/api/auctions/types";
import { CITIES } from "@/shared/config/cities";

export const MOCK_AUCTION_UUIDS = {
  first: "00000000-0000-4000-8000-000000000001",
  second: "00000000-0000-4000-8000-000000000002",
  third: "00000000-0000-4000-8000-000000000003",
  fourth: "00000000-0000-4000-8000-000000000004",
  fifth: "00000000-0000-4000-8000-000000000005",
  sixth: "00000000-0000-4000-8000-000000000006",
  seventh: "00000000-0000-4000-8000-000000000007",
  eighth: "00000000-0000-4000-8000-000000000008",
} as const;

type AuctionSeed = {
  id: string;
  number: string;
  type: AuctionType;
  status: AuctionStatus;
  from: string;
  to: string;
  loadAt: string;
  unloadAt: string;
  cargo: string;
  weightKg: number;
  volume: number | null;
  body: string;
  distance: number;
  price: number | null;
  step: number | null;
  min: number | null;
  max: number | null;
  userStatus: UserTradingStatus;
  canBet: boolean;
  hasMyBet?: boolean;
  myBet?: number | null;
  available?: number | null;
  hideBets?: boolean;
  hideContacts?: boolean;
  hidePrice?: boolean;
};

const cityById = (id: string) => CITIES.find((city) => city.uuid === id)!;

const point = (
  id: string,
  type: RoutePoint["type"],
  cityId: string,
  date: string,
  address: string,
): RoutePoint => {
  return {
    uuid: id,
    type,
    city: cityById(cityId),
    address,
    contact_name: type === "LOADING" ? "Алексей" : "Ольга",
    contact_phone: type === "LOADING" ? "+7 999 101-20-30" : "+7 999 340-55-10",
    date_from: date,
    date_to: new Date(new Date(date).getTime() + 3_600_000).toISOString(),
  };
};

const cargo = (seed: AuctionSeed): Cargo => {
  return {
    name: seed.cargo,
    weight_kg: seed.weightKg,
    volume_m3: seed.volume,
    body_type: seed.body,
    packages_count: 22,
    temperature: seed.cargo.includes("Продукт") ? "+2…+6 °C" : null,
    comment: "Бережная перевозка. Крепёжные ремни обязательны.",
  };
};

const makeAuction = (seed: AuctionSeed): AuctionDetail => {
  const loading = point(
    `${seed.id}-load`,
    "LOADING",
    seed.from,
    seed.loadAt,
    "Промышленная ул., 12",
  );
  const unloading = point(
    `${seed.id}-unload`,
    "UNLOADING",
    seed.to,
    seed.unloadAt,
    "Складская ул., 8",
  );
  const pricePerKm =
    seed.price === null ? null : Math.round(seed.price / seed.distance);

  return {
    auction_uuid: seed.id,
    cargo_num: seed.number,
    auc_type: seed.type,
    status: seed.status,
    is_available: seed.canBet,
    distance_km: seed.distance,
    route: {
      loading,
      unloading,
      points_count: 2,
    },
    points: [loading, unloading],
    cargo: cargo(seed),
    price: {
      currency: "RUB",
      current_price: seed.price,
      available_price: seed.available ?? seed.price,
      price_per_km: pricePerKm,
      min_price: seed.min,
      max_price: seed.max,
      bet_step: seed.step,
      includes_vat: true,
    },
    trading: {
      can_set_bet: seed.canBet,
      hide_bets_history: seed.hideBets ?? false,
      hide_points_address_and_contacts: seed.hideContacts ?? false,
      no_view_cargo_price: seed.hidePrice ?? false,
      user_status: seed.userStatus,
      has_my_bet: seed.hasMyBet ?? false,
      my_bet_price: seed.myBet ?? null,
      ends_at:
        seed.status === "Finished"
          ? "2026-07-27T13:00:00.000Z"
          : "2026-08-01T14:00:00.000Z",
    },
    organizer: {
      name: "ООО «Север Логистик»",
      inn: "7812456789",
      rating: 4.8,
    },
    vehicle_requirements: {
      body_type: seed.body,
      loading_type: "Задняя",
      vehicles_count: 1,
      vehicle_capacity_kg: Math.max(20_000, seed.weightKg),
    },
    payment: {
      payment_delay_days: 10,
      payment_type: "Безналичный расчёт",
      prepayment_percent: null,
      notes: "Оплата по оригиналам документов",
    },
    created_at: "2026-07-28T08:15:00.000Z",
  };
};

export const initialAuctions: AuctionDetail[] = [
  makeAuction({
    id: MOCK_AUCTION_UUIDS.first,
    number: "GR-24081",
    type: "Down",
    status: "Auction",
    from: "moscow",
    to: "spb",
    loadAt: "2026-08-02T06:00:00.000Z",
    unloadAt: "2026-08-03T08:00:00.000Z",
    cargo: "Бытовая техника",
    weightKg: 18_500,
    volume: 82,
    body: "Тентованный",
    distance: 710,
    price: 128_000,
    step: 2_000,
    min: 90_000,
    max: 180_000,
    available: 126_000,
    userStatus: "Losing",
    canBet: true,
    hasMyBet: true,
    myBet: 132_000,
  }),
  makeAuction({
    id: MOCK_AUCTION_UUIDS.second,
    number: "GR-24079",
    type: "Request",
    status: "Auction",
    from: "kazan",
    to: "ekb",
    loadAt: "2026-08-03T05:30:00.000Z",
    unloadAt: "2026-08-04T04:00:00.000Z",
    cargo: "Металлопрокат",
    weightKg: 20_000,
    volume: 34,
    body: "Бортовой",
    distance: 820,
    price: 142_000,
    step: 1_000,
    min: 110_000,
    max: 190_000,
    available: 141_000,
    userStatus: "NotParticipating",
    canBet: true,
  }),
  makeAuction({
    id: MOCK_AUCTION_UUIDS.third,
    number: "GR-24072",
    type: "FixPrice",
    status: "Planning",
    from: "kaliningrad",
    to: "moscow",
    loadAt: "2026-08-05T08:00:00.000Z",
    unloadAt: "2026-08-07T09:00:00.000Z",
    cargo: "Продукты питания",
    weightKg: 14_200,
    volume: 70,
    body: "Рефрижератор",
    distance: 1_280,
    price: 196_000,
    step: null,
    min: 196_000,
    max: 196_000,
    available: 196_000,
    userStatus: "NotParticipating",
    canBet: true,
    hideBets: true,
    hideContacts: true,
  }),
  makeAuction({
    id: MOCK_AUCTION_UUIDS.fourth,
    number: "GR-24065",
    type: "Up",
    status: "Auction",
    from: "samara",
    to: "rostov",
    loadAt: "2026-08-01T04:00:00.000Z",
    unloadAt: "2026-08-02T13:00:00.000Z",
    cargo: "Строительные смеси",
    weightKg: 19_800,
    volume: 46,
    body: "Тентованный",
    distance: 1_100,
    price: 157_000,
    step: 3_000,
    min: 120_000,
    max: 220_000,
    available: 160_000,
    userStatus: "Leading",
    canBet: true,
    hasMyBet: true,
    myBet: 157_000,
  }),
  makeAuction({
    id: MOCK_AUCTION_UUIDS.fifth,
    number: "GR-24051",
    type: "Down",
    status: "Finished",
    from: "voronezh",
    to: "spb",
    loadAt: "2026-07-28T05:00:00.000Z",
    unloadAt: "2026-07-29T14:00:00.000Z",
    cargo: "Мебель",
    weightKg: 10_600,
    volume: 88,
    body: "Фургон",
    distance: 1_220,
    price: 164_000,
    step: 2_000,
    min: 130_000,
    max: 220_000,
    userStatus: "Winner",
    canBet: false,
    hasMyBet: true,
    myBet: 164_000,
  }),
  makeAuction({
    id: MOCK_AUCTION_UUIDS.sixth,
    number: "GR-24044",
    type: "Request",
    status: "Finished",
    from: "novosibirsk",
    to: "ekb",
    loadAt: "2026-07-26T07:00:00.000Z",
    unloadAt: "2026-07-28T10:00:00.000Z",
    cargo: "Промышленное оборудование",
    weightKg: 21_000,
    volume: null,
    body: "Низкорамный трал",
    distance: 1_590,
    price: 284_000,
    step: 5_000,
    min: 200_000,
    max: 350_000,
    userStatus: "Unknown",
    canBet: false,
    hasMyBet: true,
    myBet: 297_000,
  }),
  makeAuction({
    id: MOCK_AUCTION_UUIDS.seventh,
    number: "GR-24038",
    type: "Down",
    status: "Auction",
    from: "perm",
    to: "kazan",
    loadAt: "2026-08-04T06:00:00.000Z",
    unloadAt: "2026-08-05T06:00:00.000Z",
    cargo: "Бумажная продукция",
    weightKg: 16_400,
    volume: 65,
    body: "Тентованный",
    distance: 600,
    price: null,
    step: 1_500,
    min: 70_000,
    max: 150_000,
    available: 118_000,
    userStatus: "NotParticipating",
    canBet: true,
    hidePrice: true,
  }),
  makeAuction({
    id: MOCK_AUCTION_UUIDS.eighth,
    number: "GR-24031",
    type: "FixPrice",
    status: "Canceled",
    from: "spb",
    to: "moscow",
    loadAt: "2026-08-06T08:00:00.000Z",
    unloadAt: "2026-08-07T08:00:00.000Z",
    cargo: "Косметическая продукция",
    weightKg: 8_900,
    volume: 52,
    body: "Изотермический",
    distance: 710,
    price: 119_000,
    step: null,
    min: 119_000,
    max: 119_000,
    userStatus: "NotParticipating",
    canBet: false,
  }),
];

export const initialBets: Record<string, Bet[]> = {
  [MOCK_AUCTION_UUIDS.first]: [
    {
      bet_uuid: "bet-001-a",
      auction_uuid: MOCK_AUCTION_UUIDS.first,
      price_with_vat: 128_000,
      price_without_vat: 106_667,
      carrier: { name: "ООО «ТрансПуть»", inn: "7709123456" },
      rating_place: 1,
      is_winner: false,
      is_cancelled: false,
      cancellation_reason: null,
      is_mine: false,
      created_at: "2026-07-30T09:32:00.000Z",
    },
    {
      bet_uuid: "bet-001-b",
      auction_uuid: MOCK_AUCTION_UUIDS.first,
      price_with_vat: 132_000,
      price_without_vat: 110_000,
      carrier: { name: "ООО «Вектор Карго»", inn: "3906123901" },
      rating_place: 2,
      is_winner: false,
      is_cancelled: false,
      cancellation_reason: null,
      is_mine: true,
      created_at: "2026-07-30T08:48:00.000Z",
    },
    {
      bet_uuid: "bet-001-c",
      auction_uuid: MOCK_AUCTION_UUIDS.first,
      price_with_vat: 136_000,
      price_without_vat: 113_333,
      carrier: { name: "ИП Сорокин Д. А.", inn: "631212345678" },
      rating_place: 3,
      is_winner: false,
      is_cancelled: false,
      cancellation_reason: null,
      is_mine: false,
      created_at: "2026-07-30T08:22:00.000Z",
    },
  ],
  [MOCK_AUCTION_UUIDS.second]: [
    {
      bet_uuid: "bet-002-a",
      auction_uuid: MOCK_AUCTION_UUIDS.second,
      price_with_vat: 142_000,
      price_without_vat: 118_333,
      carrier: { name: "ООО «Магистраль»", inn: "1658123400" },
      rating_place: 1,
      is_winner: false,
      is_cancelled: false,
      cancellation_reason: null,
      is_mine: false,
      created_at: "2026-07-30T07:41:00.000Z",
    },
  ],
  [MOCK_AUCTION_UUIDS.third]: [],
  [MOCK_AUCTION_UUIDS.fourth]: [
    {
      bet_uuid: "bet-004-a",
      auction_uuid: MOCK_AUCTION_UUIDS.fourth,
      price_with_vat: 157_000,
      price_without_vat: 130_833,
      carrier: { name: "ООО «Вектор Карго»", inn: "3906123901" },
      rating_place: 1,
      is_winner: false,
      is_cancelled: false,
      cancellation_reason: null,
      is_mine: true,
      created_at: "2026-07-30T10:05:00.000Z",
    },
  ],
  [MOCK_AUCTION_UUIDS.fifth]: [
    {
      bet_uuid: "bet-005-a",
      auction_uuid: MOCK_AUCTION_UUIDS.fifth,
      price_with_vat: 164_000,
      price_without_vat: 136_667,
      carrier: { name: "ООО «Вектор Карго»", inn: "3906123901" },
      rating_place: 1,
      is_winner: true,
      is_cancelled: false,
      cancellation_reason: null,
      is_mine: true,
      created_at: "2026-07-27T12:55:00.000Z",
    },
    {
      bet_uuid: "bet-005-b",
      auction_uuid: MOCK_AUCTION_UUIDS.fifth,
      price_with_vat: 168_000,
      price_without_vat: 140_000,
      carrier: { name: "ООО «ЛидерТранс»", inn: "3666123450" },
      rating_place: 2,
      is_winner: false,
      is_cancelled: false,
      cancellation_reason: null,
      is_mine: false,
      created_at: "2026-07-27T12:48:00.000Z",
    },
  ],
  [MOCK_AUCTION_UUIDS.sixth]: [],
  [MOCK_AUCTION_UUIDS.seventh]: [],
  [MOCK_AUCTION_UUIDS.eighth]: [],
};
