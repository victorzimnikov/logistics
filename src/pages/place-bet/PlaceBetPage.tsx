import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useForm, useWatch } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { ApiError, auctionsApi } from "@/shared/api/auctions/client";
import { auctionQueryKeys } from "@/shared/api/auctions/queryKeys";
import { formatMoney } from "@/shared/lib/format";
import { useUiStore } from "@/shared/model/uiStore";
import { ErrorState, PageLoader } from "@/shared/ui/FeedbackState";
import {
  BetFormValues,
  createBetSchema,
} from "@/features/price-bet/model/betSchema";

const routeApi = getRouteApi("/auctions/$auctionUuid/bet");

export const PlaceBetPage = () => {
  const { auctionUuid } = routeApi.useParams();
  const navigate = useNavigate({ from: "/auctions/$auctionUuid/bet" });
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  const detailQuery = useQuery({
    queryKey: auctionQueryKeys.detail(auctionUuid),
    queryFn: ({ signal }) => auctionsApi.getDetail(auctionUuid, signal),
  });

  const schema = useMemo(
    () => (detailQuery.data ? createBetSchema(detailQuery.data.price) : null),
    [detailQuery.data],
  );

  const form = useForm<BetFormValues>({
    resolver: schema
      ? (zodResolver(schema) as Resolver<BetFormValues>)
      : undefined,
    values: detailQuery.data
      ? {
          price:
            detailQuery.data.price.available_price ??
            detailQuery.data.price.current_price ??
            0,
        }
      : undefined,
    mode: "onBlur",
  });

  const price = useWatch({ control: form.control, name: "price" });

  const mutation = useMutation({
    mutationFn: (values: BetFormValues) =>
      auctionsApi.createBet(auctionUuid, {
        price: values.price,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: auctionQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: auctionQueryKeys.detail(auctionUuid),
        }),
        queryClient.invalidateQueries({
          queryKey: auctionQueryKeys.betsRoot(auctionUuid),
        }),
      ]);
      showToast("Ставка успешно принята", "success");
      await navigate({
        to: "/auctions/$auctionUuid",
        params: { auctionUuid },
      });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 422) {
        const priceError =
          error.payload && "errors" in error.payload
            ? error.payload.errors.find((item) => item.field === "price")
            : undefined;
        form.setError("price", {
          type: "server",
          message: priceError?.message ?? error.message,
        });
        showToast("Ставка отклонена: проверьте сумму", "error");
        return;
      }
      showToast("Не удалось отправить ставку. Попробуйте снова.", "error");
    },
  });

  if (detailQuery.isPending) {
    return (
      <Container maxWidth="md">
        <PageLoader />
      </Container>
    );
  }

  if (detailQuery.isError) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Card>
          <ErrorState onRetry={() => void detailQuery.refetch()} />
        </Card>
      </Container>
    );
  }

  const auction = detailQuery.data;
  const hasBet = auction.trading.has_my_bet;

  if (!auction.trading.can_set_bet) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 7 } }}>
        <Card sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              display: "grid",
              placeItems: "center",
              bgcolor: "#EEF2F7",
              color: "text.secondary",
              borderRadius: 4,
              mx: "auto",
              mb: 2,
            }}
          >
            <LockOutlinedIcon fontSize="large" />
          </Box>
          <Typography variant="h1" sx={{ fontSize: 25 }}>
            Ставка недоступна
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Торги по заявке {auction.cargo_num} завершены или организатор
            отключил приём ставок.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() =>
              void navigate({
                to: "/auctions/$auctionUuid",
                params: { auctionUuid },
              })
            }
          >
            Вернуться к аукциону
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2.5, md: 4 } }}>
      <Button
        startIcon={<ArrowBackRoundedIcon />}
        color="inherit"
        onClick={() =>
          void navigate({
            to: "/auctions/$auctionUuid",
            params: { auctionUuid },
          })
        }
        sx={{ mb: 2, px: 0.5 }}
      >
        К аукциону {auction.cargo_num}
      </Button>

      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            display: "grid",
            placeItems: "center",
            bgcolor: "primary.main",
            color: "white",
            borderRadius: 3,
            boxShadow: "0 10px 24px rgba(36,107,253,.24)",
          }}
        >
          <GavelRoundedIcon />
        </Box>
        <Box>
          <Typography variant="h1">
            {hasBet ? "Изменить ставку" : "Сделать ставку"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Проверьте сумму перед отправкой — ставка сразу попадёт в торги
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.3fr) 280px" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Card
          component="form"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          sx={{ p: { xs: 2.25, md: 3 } }}
        >
          <Typography variant="h2">Параметры ставки</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
            Заявка {auction.cargo_num} · {auction.route.loading.city.name}
            <ArrowForwardRoundedIcon
              sx={{ mx: 0.6, fontSize: 14, verticalAlign: "middle" }}
            />
            {auction.route.unloading.city.name}
          </Typography>

          {hasBet && (
            <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mt: 2.5 }}>
              Текущая ваша ставка —{" "}
              <b>{formatMoney(auction.trading.my_bet_price)}</b>. После
              изменения она будет отмечена как отменённая.
            </Alert>
          )}

          <TextField
            label="Сумма ставки"
            type="number"
            fullWidth
            autoFocus
            error={Boolean(form.formState.errors.price)}
            helperText={
              form.formState.errors.price?.message ??
              `Доступная цена: ${formatMoney(auction.price.available_price)}`
            }
            {...form.register("price", { valueAsNumber: true })}
            slotProps={{
              htmlInput: {
                step: auction.price.bet_step ?? "any",
                min: auction.price.min_price ?? 1,
                max: auction.price.max_price ?? undefined,
              },
            }}
            sx={{ mt: 3 }}
          />

          <Stack
            direction="row"
            flexWrap="wrap"
            useFlexGap
            spacing={1}
            sx={{ mt: 1.5 }}
          >
            {auction.price.min_price !== null && (
              <Chip
                size="small"
                variant="outlined"
                label={`Мин. ${formatMoney(auction.price.min_price)}`}
              />
            )}
            {auction.price.max_price !== null && (
              <Chip
                size="small"
                variant="outlined"
                label={`Макс. ${formatMoney(auction.price.max_price)}`}
              />
            )}
            {auction.price.bet_step !== null && (
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={`Шаг ${formatMoney(auction.price.bet_step)}`}
              />
            )}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.25}>
            <Button
              variant="outlined"
              fullWidth
              disabled={mutation.isPending}
              onClick={() =>
                void navigate({
                  to: "/auctions/$auctionUuid",
                  params: { auctionUuid },
                })
              }
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              loading={mutation.isPending}
              startIcon={<CheckCircleOutlineRoundedIcon />}
            >
              {mutation.isPending ? "Отправляем…" : "Подтвердить ставку"}
            </Button>
          </Stack>
        </Card>

        <Stack spacing={2}>
          <Card sx={{ p: 2.5, bgcolor: "#162440", color: "white" }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PaymentsOutlinedIcon sx={{ opacity: 0.74 }} />
              <Typography sx={{ fontWeight: 800 }}>Расчёт</Typography>
            </Stack>
            <Typography variant="caption" sx={{ opacity: 0.68, mt: 2 }}>
              Ваша ставка
            </Typography>
            <Typography
              sx={{ fontSize: 25, fontWeight: 800, letterSpacing: "-0.04em" }}
            >
              {Number.isFinite(price) && price > 0 ? formatMoney(price) : "—"}
            </Typography>
            <Divider sx={{ borderColor: "rgba(255,255,255,.12)", my: 1.5 }} />
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" sx={{ opacity: 0.65 }}>
                  Текущая цена
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {formatMoney(auction.price.current_price)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" sx={{ opacity: 0.65 }}>
                  Цена за км
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {price > 0 && auction.distance_km > 0
                    ? formatMoney(Math.round(price / auction.distance_km))
                    : "—"}
                </Typography>
              </Stack>
            </Stack>
          </Card>

          <Alert severity="warning" variant="outlined">
            Отправляя ставку, вы подтверждаете готовность выполнить перевозку на
            указанных условиях.
          </Alert>
        </Stack>
      </Box>
    </Container>
  );
};
