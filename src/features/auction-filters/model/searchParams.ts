import { z } from "zod";
import { AUCTION_FILTER_TYPES } from "@/shared/api/auctions/types";
import type { AuctionListRequestDto } from "@/shared/api/auctions/types";
import { CITIES } from "@/shared/config/cities";

const optionalString = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.string().trim().optional(),
);

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value == null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}, z.number().nonnegative().optional());

const optionalBoolean = z.preprocess((value) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
}, z.boolean().optional());

const statusesSchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.length > 0) return value.split(",");
    return [];
  },
  z.array(z.coerce.number().int().min(1).max(7)).catch([]),
);

export const auctionSearchSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  cargo_num: optionalString.catch(undefined),
  statuses: statusesSchema,
  auc_type: z.enum(AUCTION_FILTER_TYPES).optional().catch(undefined),
  load_city: optionalString.catch(undefined),
  unload_city: optionalString.catch(undefined),
  loading_date_from: optionalString.catch(undefined),
  loading_date_to: optionalString.catch(undefined),
  is_available: optionalBoolean.catch(undefined),
  is_bidder: optionalBoolean.catch(undefined),
  price_from: optionalNumber.catch(undefined),
  price_to: optionalNumber.catch(undefined),
});

export type AuctionSearch = z.infer<typeof auctionSearchSchema>;

export const DEFAULT_AUCTION_SEARCH: AuctionSearch = auctionSearchSchema.parse(
  {},
);

export const parseAuctionSearch = (input: unknown): AuctionSearch => {
  return auctionSearchSchema.parse(input);
};

const toApiDateTime = (value: string, endOfDay: boolean): string => {
  if (value.includes("T")) return value;
  return new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`,
  ).toISOString();
};

export const buildAuctionListRequest = (
  search: AuctionSearch,
): AuctionListRequestDto => {
  const request: AuctionListRequestDto = {
    page: search.page,
    per_page: 5,
  };

  if (search.cargo_num) request.cargo_num = search.cargo_num;
  if (search.statuses.length > 0) {
    request.statuses = search.statuses;
  }
  if (search.auc_type) request.auc_type = [search.auc_type];
  if (search.load_city) {
    request.load_city =
      CITIES.find((city) => city.uuid === search.load_city)?.name ??
      search.load_city;
  }
  if (search.unload_city) {
    request.unload_city =
      CITIES.find((city) => city.uuid === search.unload_city)?.name ??
      search.unload_city;
  }
  if (search.loading_date_from) {
    request.load_date_from = toApiDateTime(search.loading_date_from, false);
  }
  if (search.loading_date_to) {
    request.load_date_to = toApiDateTime(search.loading_date_to, true);
  }
  if (search.is_available !== undefined) {
    request.is_available = search.is_available;
  }
  if (search.is_bidder !== undefined) request.is_bidder = search.is_bidder;
  if (search.price_from !== undefined) {
    request.current_price_from = search.price_from;
  }
  if (search.price_to !== undefined) request.current_price_to = search.price_to;

  return request;
};

export const countActiveFilters = (search: AuctionSearch): number => {
  return Object.entries(search).reduce((count, [key, value]) => {
    if (key === "page") return count;
    if (Array.isArray(value)) return count + (value.length > 0 ? 1 : 0);
    return count + (value !== undefined && value !== "" ? 1 : 0);
  }, 0);
};
