import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Drawer,
  IconButton,
  Pagination,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { queryClient } from "@/app/queryClient";
import { AuctionCard } from "@/entities/auction/ui/AuctionCard";
import { AuctionFilters } from "@/features/auction-filters/ui/AuctionFilters";
import {
  DEFAULT_AUCTION_SEARCH,
  buildAuctionListRequest,
  countActiveFilters,
  type AuctionSearch,
} from "@/features/auction-filters/model/searchParams";
import { auctionsApi } from "@/shared/api/auctions/client";
import { auctionQueryKeys } from "@/shared/api/auctions/queryKeys";
import { useUiStore } from "@/shared/model/uiStore";
import { EmptyState, ErrorState } from "@/shared/ui/FeedbackState";

const routeApi = getRouteApi("/auctions");

const AuctionListSkeleton = () => {
  return (
    <Stack spacing={1.5}>
      {[1, 2, 3].map((item) => (
        <Card key={item} sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack direction="row" justifyContent="space-between">
            <Skeleton width={210} height={30} />
            <Skeleton width={150} height={28} />
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.5fr .7fr" },
              gap: 4,
              mt: 3,
            }}
          >
            <Box>
              <Skeleton width="72%" height={34} />
              <Skeleton width="88%" height={22} />
            </Box>
            <Box>
              <Skeleton width="70%" height={36} />
              <Skeleton width="90%" height={20} />
            </Box>
          </Box>
        </Card>
      ))}
    </Stack>
  );
};

export const AuctionsPage = () => {
  const search = routeApi.useSearch();
  const navigate = useNavigate({ from: "/auctions" });
  const filtersOpen = useUiStore((state) => state.filtersOpen);
  const openFilters = useUiStore((state) => state.openFilters);
  const closeFilters = useUiStore((state) => state.closeFilters);
  const request = buildAuctionListRequest(search);

  const query = useQuery({
    queryKey: auctionQueryKeys.list(request),
    queryFn: ({ signal }) => auctionsApi.getList(request, signal),
    placeholderData: keepPreviousData,
  });

  const applyFilters = (next: AuctionSearch) => {
    void navigate({ search: next, replace: true });
  };

  const resetFilters = () => {
    void navigate({ search: DEFAULT_AUCTION_SEARCH, replace: true });
  };

  const mode = search.is_bidder
    ? "mine"
    : search.is_available
      ? "available"
      : "all";

  const setMode = (nextMode: string | null) => {
    if (!nextMode) return;
    void navigate({
      search: {
        ...search,
        page: 1,
        is_available: nextMode === "available" ? true : undefined,
        is_bidder: nextMode === "mine" ? true : undefined,
      },
      replace: true,
    });
  };

  const openAuction = (auctionUuid: string) => {
    void navigate({
      to: "/auctions/$auctionUuid",
      params: { auctionUuid },
    });
  };

  const openAction = (auctionUuid: string, canSetBet: boolean) => {
    void navigate({
      to: canSetBet ? "/auctions/$auctionUuid/bet" : "/auctions/$auctionUuid",
      params: { auctionUuid },
    });
  };

  const prefetch = (auctionUuid: string) => {
    void queryClient.prefetchQuery({
      queryKey: auctionQueryKeys.detail(auctionUuid),
      queryFn: ({ signal }) => auctionsApi.getDetail(auctionUuid, signal),
    });
  };

  return (
    <>
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4.5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h1">Грузовые аукционы</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.6, fontSize: 14 }}>
              Подбирайте выгодные рейсы и управляйте ставками
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            disabled
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          >
            Создать заявку
          </Button>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 2.25 }}
        >
          <ToggleButtonGroup
            exclusive
            value={mode}
            onChange={(_, value) => setMode(value as string | null)}
            size="small"
            sx={{
              bgcolor: "background.paper",
              "& .MuiToggleButton-root": {
                border: 0,
                px: { xs: 1.5, sm: 2.5 },
                fontWeight: 700,
                textTransform: "none",
              },
            }}
          >
            <ToggleButton value="all">Все</ToggleButton>
            <ToggleButton value="available">Доступные</ToggleButton>
            <ToggleButton value="mine">Мои ставки</ToggleButton>
          </ToggleButtonGroup>

          <Button
            aria-label="Открыть фильтры"
            variant="outlined"
            startIcon={
              <Badge
                color="primary"
                badgeContent={countActiveFilters(search)}
                invisible={countActiveFilters(search) === 0}
              >
                <FilterAltRoundedIcon />
              </Badge>
            }
            onClick={openFilters}
            sx={{ display: { lg: "none" }, flexShrink: 0 }}
          >
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Фильтры
            </Box>
          </Button>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "292px minmax(0, 1fr)" },
            gap: 2.5,
            alignItems: "start",
          }}
        >
          <Card
            sx={{
              display: { xs: "none", lg: "block" },
              p: 2.5,
              maxHeight: "calc(100vh - 118px)",
              overflowY: "auto",
              position: "sticky",
              top: 92,
            }}
          >
            <AuctionFilters
              value={search}
              onApply={applyFilters}
              onReset={resetFilters}
            />
          </Card>

          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ minHeight: 28, mb: 1.5 }}
            >
              <Typography variant="body2" color="text.secondary">
                {query.data
                  ? `Найдено аукционов: ${query.data.pagination.total}`
                  : "Загружаем аукционы…"}
              </Typography>
              {query.isFetching && !query.isPending && (
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                >
                  Обновляем…
                </Typography>
              )}
            </Stack>

            {query.isPending ? (
              <AuctionListSkeleton />
            ) : query.isError ? (
              <Card>
                <ErrorState onRetry={() => void query.refetch()} />
              </Card>
            ) : query.data.items.length === 0 ? (
              <Card>
                <EmptyState
                  title="Аукционы не найдены"
                  description="Попробуйте изменить параметры поиска или сбросить фильтры."
                  actionLabel="Сбросить фильтры"
                  onAction={resetFilters}
                />
              </Card>
            ) : (
              <>
                <Stack spacing={1.5}>
                  {query.data.items.map((auction) => (
                    <AuctionCard
                      key={auction.auction_uuid}
                      auction={auction}
                      onOpen={() => openAuction(auction.auction_uuid)}
                      onAction={() =>
                        openAction(
                          auction.auction_uuid,
                          auction.trading.can_set_bet,
                        )
                      }
                      onPrefetch={() => prefetch(auction.auction_uuid)}
                    />
                  ))}
                </Stack>
                {query.data.pagination.total_pages > 1 && (
                  <Stack alignItems="center" sx={{ py: 3 }}>
                    <Pagination
                      color="primary"
                      count={query.data.pagination.total_pages}
                      page={query.data.pagination.page}
                      onChange={(_, page) =>
                        void navigate({
                          search: { ...search, page },
                          replace: true,
                        })
                      }
                    />
                  </Stack>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>

      <Drawer
        anchor="right"
        open={filtersOpen}
        onClose={closeFilters}
        slotProps={{
          paper: {
            sx: { width: { xs: "100%", sm: 380 }, p: 2.5 },
          },
        }}
      >
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
          <IconButton onClick={closeFilters} aria-label="Закрыть фильтры">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <AuctionFilters
          value={search}
          onApply={applyFilters}
          onReset={resetFilters}
          onClose={closeFilters}
        />
      </Drawer>
    </>
  );
};
