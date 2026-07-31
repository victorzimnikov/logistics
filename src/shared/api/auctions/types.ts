export const AUCTION_TYPES = [
  "Request",
  "Up",
  "Down",
  "FixPrice",
  "Unknown",
] as const;
export type AuctionType = (typeof AUCTION_TYPES)[number];
export const AUCTION_FILTER_TYPES = [
  "Request",
  "Up",
  "Down",
  "FixPrice",
] as const;

export const AUCTION_STATUSES = [
  "Planning",
  "Auction",
  "DeterminateWinner",
  "WaitDeal",
  "InProgress",
  "Finished",
  "Stopped",
  "Canceled",
  "Unknown",
] as const;
export type AuctionStatus = (typeof AUCTION_STATUSES)[number];

export const USER_TRADING_STATUSES = [
  "NotParticipating",
  "Leading",
  "Losing",
  "OnPending",
  "Confirmed",
  "ChoosingWinner",
  "Winner",
  "Accepted",
  "Unknown",
] as const;
export type UserTradingStatus = (typeof USER_TRADING_STATUSES)[number];

export const AUCTION_STATUS_FILTERS = [
  { value: 1, status: "Planning" },
  { value: 2, status: "Auction" },
  { value: 3, status: "DeterminateWinner" },
  { value: 4, status: "WaitDeal" },
  { value: 5, status: "InProgress" },
  { value: 6, status: "Finished" },
  { value: 7, status: "Stopped" },
] as const satisfies ReadonlyArray<{
  value: number;
  status: AuctionStatus;
}>;
export type AuctionStatusFilter =
  (typeof AUCTION_STATUS_FILTERS)[number]["value"];

export type SortDirection = "asc" | "desc";

// OpenAPI request/response DTOs. Fields not marked as required in the source
// contract are optional here so the adapters can report a useful runtime error.
export type AuctionListRequestDto = {
  page?: number;
  per_page?: number;
  is_oldest?: boolean;
  sort?: Record<string, SortDirection> | null;
  status?: UserTradingStatus[];
  mobile_statuses?: number[];
  statuses?: number[];
  cargo_num?: string;
  weight_from?: number;
  weight_to?: number;
  volume_from?: number;
  volume_to?: number;
  body_types?: string[];
  form_type?: string | null;
  is_international_shipment?: boolean;
  load_city?: string;
  load_gc_id?: number;
  load_range?: number;
  unload_city?: string;
  unload_gc_id?: number;
  unload_range?: number;
  load_date_from?: string;
  load_date_to?: string;
  unload_date_from?: string;
  unload_date_to?: string;
  create_date_from?: string;
  create_date_to?: string;
  start_time_from?: string;
  start_time_to?: string;
  stop_time_from?: string;
  stop_time_to?: string;
  is_available?: boolean;
  is_favorite?: boolean;
  is_bidder?: boolean;
  customer?: string;
  customer_ids?: number[];
  contractor?: string | null;
  auction_ids?: number[];
  replace_external_pads?: boolean | null;
  current_price_from?: number | null;
  current_price_to?: number | null;
  price_per_km_from?: number | null;
  price_per_km_to?: number | null;
  auc_type?: Exclude<AuctionType, "Unknown">[];
};

export type AuctionListRoutePointDto = {
  city?: string;
  address?: string;
  date?: string;
  city_gc_id?: number;
  points_count?: number;
};

export type AuctionListItemApiDto = {
  main?: {
    id?: number;
    cargo_num?: string;
    cargo_date?: string;
    auc_type?: AuctionType;
    order_uid?: string;
    created_at?: string;
    priority_sort?: number;
    is_assembly?: boolean;
    price_per_km?: number | null;
  };
  organizer?: {
    subscriber_id?: number;
    organization_id?: number;
    organization_name?: string;
    organization_inn?: string;
    organization_kpp?: string;
    is_hide_organization?: boolean;
  };
  route?: {
    load?: AuctionListRoutePointDto;
    unload?: AuctionListRoutePointDto;
  };
  cargo?: {
    name?: string;
    weight?: number;
    volume?: number;
    body_type?: string;
    truck_count?: number;
    temp_from?: number | null;
    temp_to?: number | null;
  };
  trading?: {
    status?: AuctionStatus;
    status_mobile?: UserTradingStatus;
    start_time?: string;
    stop_time?: string;
    can_set_bet?: boolean;
    hide_points_address_and_contacts?: boolean;
    is_bidder?: boolean;
    is_available?: boolean;
    price?: {
      start?: number;
      current?: number;
      current_no_vat?: number;
    } | null;
    your?: {
      bet?: boolean;
      last_bet?: number | null;
    } | null;
    is_last_bet_with_vat?: boolean | null;
  };
  payment?: {
    form?: string;
    currency_code?: string;
    consignor?: string | null;
    consignee?: string | null;
  };
};

export type AuctionListResponseDto = {
  data?: AuctionListItemApiDto[];
  meta?: {
    current_page?: number;
    from?: number;
    last_page?: number;
    per_page?: number;
    to?: number;
    total?: number;
  };
};

export type RoutePointApiDto = {
  row_num?: number;
  op_type?: "Loading" | "Unloading" | "Unknown";
  start_date?: string;
  end_date?: string;
  comment?: string | null;
  contractor?: string;
  contractor_inn?: string;
  location?: {
    city_name?: string;
    city_full_name?: string;
    city_gc_id?: number;
    loading_address?: string;
    lon?: number;
    lat?: number;
  };
  cargo?: {
    name?: string;
    package_name?: string;
    weight?: string;
    volume?: string;
    length?: string;
    width?: string;
    height?: string;
    oversized?: boolean;
    package_amount?: number | null;
  };
  contact?: {
    name?: string;
    phone?: string;
  };
};

export type AuctionShowResponseDto = {
  main: {
    id?: number;
    cargo_num?: string;
    cargo_date?: string;
    order_uid?: string;
    auc_type?: AuctionType;
    created_at?: string;
  };
  organizer: {
    subscriber_id?: number;
    subscriber_code?: string;
    infobase_code?: string;
    organization_name?: string;
    organization_inn?: string;
    organization_kpp?: string;
    organization_id?: number;
  };
  contacts: Array<{
    name?: string;
    phone?: string;
    email?: string | null;
  }>;
  cargo: {
    price?: string;
    currency?: number | null;
    is_international?: boolean;
    distance?: number | null;
    truck_count?: number;
    body_type?: string;
    temp_from?: number | null;
    temp_to?: number | null;
    loading_types?: {
      side?: boolean;
      top?: boolean;
      rear?: boolean;
      full?: boolean;
    };
    car?: {
      type?: string;
      weight?: number | null;
      volume?: number | null;
      width?: number | null;
      length?: number | null;
      height?: number | null;
    };
  };
  trading: {
    status?: AuctionStatus;
    status_mobile?: UserTradingStatus;
    start_time?: string;
    stop_time?: string;
    can_set_bet?: boolean;
    hide_bets_history?: boolean;
    no_view_cargo_price?: boolean;
    hide_points_address_and_contacts?: boolean;
    is_bidder?: boolean;
    is_last_bet_with_vat?: boolean | null;
    price?: {
      start?: number | null;
      start_no_vat?: number | null;
      current?: number | null;
      current_no_vat?: number | null;
      available?: number | null;
      available_no_vat?: number | null;
      min?: number | null;
      min_no_vat?: number | null;
      max?: number | null;
      max_no_vat?: number | null;
      step?: number | null;
      step_no_vat?: number | null;
      price_per_km?: number;
    };
    your?: {
      bet?: boolean;
      last_bet?: number | null;
      last_bet_with_vat?: number | null;
      win?: boolean;
    };
  };
  payment: {
    condition?: string | null;
    condition_predefined?: string | null;
    form?: string;
    delay?: number | null;
    delay_type?: string;
    currency_code?: string;
    prepay?: string | null;
  };
  assembly: {
    num?: string | null;
    date?: string | null;
  };
  routes: RoutePointApiDto[];
  admitted_organizations: Array<Record<string, unknown>>;
  hide_bets_history?: boolean;
};

export type BetItemDto = {
  id?: number;
  created_at?: string;
  auction_id?: number;
  subscriber_id?: number;
  contact_name?: string;
  contact_phone?: string;
  price_with_vat?: number;
  price_no_vat?: number;
  organization_id?: number;
  organization_inn?: string;
  organization_name?: string;
  transporter_comment?: string | null;
  is_rejected?: boolean;
  is_counter?: boolean;
  place?: number | null;
  is_win?: boolean;
  run_number?: number;
  cancel_reason?: string;
  price_info?: {
    price_with_vat?: number | null;
    price_no_vat?: number | null;
    payment_type?: string | null;
    vat_rate?: string | null;
  };
};

export type BetListResponseDto = {
  bets: BetItemDto[];
};

export type SetBetRequestDto = {
  price: number;
};

export type ProblemDetailDto = {
  code: string;
  title: string;
  message: string;
  trace_id?: string | null;
};

export type ValidationProblemDto = ProblemDetailDto & {
  errors: Array<{
    field: string;
    message: string;
    code?: string | null;
  }>;
};

export type ApiProblemDto = ProblemDetailDto | ValidationProblemDto;

// Normalized application model. The API client is the only layer that maps
// OpenAPI DTOs into these UI-oriented values.
export type City = {
  uuid: string;
  name: string;
  gc_id?: number;
};

export type RoutePoint = {
  uuid: string;
  type: "LOADING" | "UNLOADING";
  city: City;
  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  date_from: string;
  date_to: string;
};

export type Cargo = {
  name: string;
  weight_kg: number;
  volume_m3: number | null;
  body_type: string;
  packages_count: number | null;
  temperature: string | null;
  comment: string | null;
};

export type Price = {
  currency: "RUB";
  current_price: number | null;
  available_price: number | null;
  price_per_km: number | null;
  min_price: number | null;
  max_price: number | null;
  bet_step: number | null;
  includes_vat: boolean;
};

export type Trading = {
  can_set_bet: boolean;
  hide_bets_history: boolean;
  hide_points_address_and_contacts: boolean;
  no_view_cargo_price: boolean;
  user_status: UserTradingStatus;
  has_my_bet: boolean;
  my_bet_price: number | null;
  ends_at: string;
};

export type AuctionListItem = {
  auction_uuid: string;
  cargo_num: string;
  auc_type: AuctionType;
  status: AuctionStatus;
  is_available: boolean;
  distance_km: number;
  route: {
    loading: RoutePoint;
    unloading: RoutePoint;
    points_count: number;
  };
  cargo: Cargo;
  price: Price;
  trading: Trading;
};

export type AuctionDetail = AuctionListItem & {
  organizer: {
    name: string;
    inn: string;
    rating: number | null;
  };
  points: RoutePoint[];
  vehicle_requirements: {
    body_type: string;
    loading_type: string;
    vehicles_count: number;
    vehicle_capacity_kg: number;
  };
  payment: {
    payment_delay_days: number;
    payment_type: string;
    prepayment_percent: number | null;
    notes: string | null;
  };
  created_at: string;
};

export type AuctionListPage = {
  items: AuctionListItem[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};

export type Bet = {
  bet_uuid: string;
  auction_uuid: string;
  price_with_vat: number;
  price_without_vat: number;
  carrier: {
    name: string;
    inn: string;
  };
  rating_place: number;
  is_winner: boolean;
  is_cancelled: boolean;
  cancellation_reason: string | null;
  is_mine: boolean;
  created_at: string;
};

export type BetsPage = {
  items: Bet[];
  participants_count: number;
};
