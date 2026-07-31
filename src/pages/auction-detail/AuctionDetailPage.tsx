import { useQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import { DEFAULT_AUCTION_SEARCH } from "@/features/auction-filters/model/searchParams";
import { auctionsApi } from "@/shared/api/auctions/client";
import { auctionQueryKeys } from "@/shared/api/auctions/queryKeys";
import {
  formatCompactDate,
  formatFullDate,
  formatMoney,
  formatTimeLeft,
  formatWeight,
} from "@/shared/lib/format";
import { ErrorState, PageLoader } from "@/shared/ui/FeedbackState";
import {
  AUCTION_STATUS_LABELS,
  AUCTION_TYPE_LABELS,
} from "@/shared/config/labels";
import { BetsPanel } from "@/widgets/bets-panel/BetsPanel";

const routeApi = getRouteApi("/auctions/$auctionUuid");



const DetailSection = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Card sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        sx={{ mb: 2.25 }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            display: "grid",
            placeItems: "center",
            bgcolor: "primary.light",
            color: "primary.main",
            borderRadius: 2.5,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h2">{title}</Typography>
      </Stack>
      {children}
    </Card>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" textAlign="right" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Stack>
  );
};

export const AuctionDetailPage = () => {
  const { auctionUuid } = routeApi.useParams();
  const navigate = useNavigate({ from: "/auctions/$auctionUuid" });
  const query = useQuery({
    queryKey: auctionQueryKeys.detail(auctionUuid),
    queryFn: ({ signal }) => auctionsApi.getDetail(auctionUuid, signal),
  });

  if (query.isPending) {
    return (
      <Container maxWidth="lg">
        <PageLoader />
      </Container>
    );
  }

  if (query.isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Card>
          <ErrorState onRetry={() => void query.refetch()} />
        </Card>
      </Container>
    );
  }

  const auction = query.data;
  const hiddenContacts = auction.trading.hide_points_address_and_contacts;
  const hiddenPrice = auction.trading.no_view_cargo_price;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
      <Button
        startIcon={<ArrowBackRoundedIcon />}
        color="inherit"
        onClick={() =>
          void navigate({
            to: "/auctions",
            search: DEFAULT_AUCTION_SEARCH,
          })
        }
        sx={{ mb: 2, px: 0.5 }}
      >
        Все аукционы
      </Button>

      <Card sx={{ overflow: "hidden", mb: 2.5 }}>
        <Box
          sx={{
            p: { xs: 2.25, md: 3.5 },
            background:
              "linear-gradient(125deg, #13213B 0%, #1C3158 68%, #224682 100%)",
            color: "white",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={3}
          >
            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  Заявка
                </Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
                  {auction.cargo_num}
                </Typography>
                <Chip
                  label={AUCTION_TYPE_LABELS[auction.auc_type]}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,.12)", color: "white" }}
                />
                <Chip
                  label={AUCTION_STATUS_LABELS[auction.status]}
                  size="small"
                  sx={{ bgcolor: "#D9F7EA", color: "#126347" }}
                />
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                spacing={{ xs: 1, sm: 2 }}
                sx={{ mt: 3 }}
              >
                <Typography
                  sx={{ fontSize: { xs: 22, sm: 29 }, fontWeight: 800 }}
                >
                  {auction.route.loading.city.name}
                </Typography>
                <Box
                  sx={{
                    height: 1,
                    flex: 1,
                    maxWidth: 110,
                    bgcolor: "rgba(255,255,255,.36)",
                  }}
                />
                <ArrowForwardRoundedIcon sx={{ opacity: 0.7 }} />
                <Typography
                  sx={{ fontSize: { xs: 22, sm: 29 }, fontWeight: 800 }}
                >
                  {auction.route.unloading.city.name}
                </Typography>
              </Stack>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 0.75, sm: 2.5 }}
                sx={{ mt: 1.25, opacity: 0.76 }}
              >
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <CalendarMonthRoundedIcon sx={{ fontSize: 17 }} />
                  <Typography variant="body2">
                    {formatCompactDate(auction.route.loading.date_from)} →{" "}
                    {formatCompactDate(auction.route.unloading.date_from)}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <LocalShippingOutlinedIcon sx={{ fontSize: 17 }} />
                  <Typography variant="body2">
                    {auction.distance_km.toLocaleString("ru-RU")} км
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Box
              sx={{
                minWidth: { md: 280 },
                pl: { md: 3.5 },
                borderLeft: { md: "1px solid rgba(255,255,255,.16)" },
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.68 }}>
                Текущая цена
              </Typography>
              <Typography
                sx={{
                  fontSize: 32,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  mt: 0.25,
                }}
              >
                {hiddenPrice
                  ? "Цена скрыта"
                  : formatMoney(auction.price.current_price)}
              </Typography>
              {!hiddenPrice && (
                <Typography variant="caption" sx={{ opacity: 0.68 }}>
                  {formatMoney(auction.price.price_per_km)}/км ·{" "}
                  {auction.price.includes_vat ? "с НДС" : "без НДС"}
                </Typography>
              )}
              <Button
                variant="contained"
                fullWidth
                disabled={!auction.trading.can_set_bet}
                startIcon={<GavelRoundedIcon />}
                onClick={() =>
                  void navigate({
                    to: "/auctions/$auctionUuid/bet",
                    params: { auctionUuid },
                  })
                }
                sx={{
                  mt: 2,
                  bgcolor: "white",
                  color: "primary.dark",
                  "&:hover": { bgcolor: "#EAF1FF" },
                }}
              >
                {auction.trading.has_my_bet
                  ? "Изменить ставку"
                  : "Сделать ставку"}
              </Button>
            </Box>
          </Stack>
        </Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          divider={<Divider orientation="vertical" flexItem />}
          spacing={{ xs: 1.25, sm: 2.5 }}
          sx={{ px: { xs: 2.25, md: 3.5 }, py: 1.6, bgcolor: "#FBFCFE" }}
        >
          <Stack direction="row" spacing={0.8} alignItems="center">
            <TimerOutlinedIcon color="primary" sx={{ fontSize: 18 }} />
            <Typography variant="caption">
              До конца: <b>{formatTimeLeft(auction.trading.ends_at)}</b>
            </Typography>
          </Stack>
          <Typography variant="caption"
            color={
              ["Leading", "Winner"].includes(auction.trading.user_status)
                ? "success.main"
                : "text.secondary"
            }
            sx={{ fontWeight: 800 }}
          >
            {auction.trading.has_my_bet
              ? `Моя ставка: ${formatMoney(auction.trading.my_bet_price)}`
              : "Вы ещё не участвуете"}
          </Typography>
        </Stack>
      </Card>

      {!auction.trading.can_set_bet && (
        <Alert severity="info" sx={{ mb: 2.5 }}>
          Установка ставки недоступна: торги завершены или ограничены
          организатором.
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1.45fr) minmax(300px, .75fr)",
          },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <Stack spacing={2.5}>
          <DetailSection icon={<PlaceOutlinedIcon />} title="Маршрут">
            <Stack spacing={0}>
              {auction.points.map((point, index) => (
                <Stack direction="row" spacing={1.75} key={point.uuid}>
                  <Stack alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        mt: 0.5,
                        borderRadius: "50%",
                        bgcolor:
                          point.type === "LOADING"
                            ? "primary.main"
                            : "secondary.main",
                        boxShadow: "0 0 0 4px rgba(36,107,253,.1)",
                      }}
                    />
                    {index < auction.points.length - 1 && (
                      <Box
                        sx={{
                          width: 1,
                          flex: 1,
                          minHeight: 62,
                          bgcolor: "divider",
                        }}
                      />
                    )}
                  </Stack>
                  <Box sx={{ pb: index < auction.points.length - 1 ? 2.5 : 0 }}>
                    <Typography variant="overline"
                      color="text.secondary"
                    >
                      {point.type === "LOADING" ? "ПОГРУЗКА" : "ВЫГРУЗКА"}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, mt: 0.3 }}>
                      {point.city.name}
                    </Typography>
                    <Typography variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.3 }}
                    >
                      {hiddenContacts ? "Точный адрес скрыт" : point.address}
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 0.5 }}>
                      {formatFullDate(point.date_from)}
                    </Typography>
                    {!hiddenContacts && point.contact_name && (
                      <Typography variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.3 }}
                      >
                        Контакт: {point.contact_name}, {point.contact_phone}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              ))}
            </Stack>
          </DetailSection>

          <DetailSection
            icon={<Inventory2OutlinedIcon />}
            title="Груз и транспорт"
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 3,
              }}
            >
              <Stack spacing={1.2}>
                <Typography sx={{ fontWeight: 800 }}>
                  {auction.cargo.name}
                </Typography>
                <InfoRow
                  label="Вес"
                  value={formatWeight(auction.cargo.weight_kg)}
                />
                <InfoRow
                  label="Объём"
                  value={
                    auction.cargo.volume_m3 === null
                      ? "Не указан"
                      : `${auction.cargo.volume_m3} м³`
                  }
                />
                <InfoRow
                  label="Мест"
                  value={auction.cargo.packages_count ?? "—"}
                />
                {auction.cargo.temperature && (
                  <InfoRow
                    label="Температура"
                    value={auction.cargo.temperature}
                  />
                )}
              </Stack>
              <Stack spacing={1.2}>
                <InfoRow
                  label="Тип кузова"
                  value={auction.vehicle_requirements.body_type}
                />
                <InfoRow
                  label="Тип загрузки"
                  value={auction.vehicle_requirements.loading_type}
                />
                <InfoRow
                  label="Машин"
                  value={auction.vehicle_requirements.vehicles_count}
                />
                <InfoRow
                  label="Грузоподъёмность"
                  value={formatWeight(
                    auction.vehicle_requirements.vehicle_capacity_kg,
                  )}
                />
              </Stack>
            </Box>
            {auction.cargo.comment && (
              <Alert
                severity="info"
                icon={<ShieldOutlinedIcon />}
                sx={{ mt: 2.5 }}
              >
                {auction.cargo.comment}
              </Alert>
            )}
          </DetailSection>
        </Stack>

        <Stack spacing={2.5}>
          <DetailSection icon={<PaymentsOutlinedIcon />} title="Условия торгов">
            <Stack spacing={1.25}>
              <InfoRow
                label="Доступная цена"
                value={
                  hiddenPrice
                    ? "Скрыто"
                    : auction.price.available_price === null
                      ? "Не указана"
                      : formatMoney(auction.price.available_price)
                }
              />
              <InfoRow
                label="Шаг ставки"
                value={
                  auction.price.bet_step === null
                    ? "Не задан"
                    : formatMoney(auction.price.bet_step)
                }
              />
              <InfoRow
                label="Минимум"
                value={
                  auction.price.min_price === null
                    ? "Не задан"
                    : formatMoney(auction.price.min_price)
                }
              />
              <InfoRow
                label="Максимум"
                value={
                  auction.price.max_price === null
                    ? "Не задан"
                    : formatMoney(auction.price.max_price)
                }
              />
              <Divider />
              <InfoRow label="Расчёт" value={auction.payment.payment_type} />
              <InfoRow
                label="Отсрочка"
                value={`${auction.payment.payment_delay_days} дней`}
              />
              <InfoRow
                label="Условия"
                value={auction.payment.notes ?? "Стандартные"}
              />
            </Stack>
          </DetailSection>

          <DetailSection
            icon={<PersonOutlineRoundedIcon />}
            title="Организатор"
          >
            <Typography sx={{ fontWeight: 800 }}>
              {auction.organizer.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              ИНН {auction.organizer.inn}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Chip
                size="small"
                label={`Рейтинг ${auction.organizer.rating ?? "—"}`}
                color="success"
                variant="outlined"
              />
              {hiddenContacts && (
                <Chip
                  size="small"
                  icon={<LockOutlinedIcon />}
                  label="Контакты скрыты"
                  variant="outlined"
                />
              )}
            </Stack>
          </DetailSection>
        </Stack>
      </Box>

      <Box id="bets" sx={{ mt: 2.5, scrollMarginTop: 90 }}>
        <BetsPanel
          auctionUuid={auctionUuid}
          hidden={auction.trading.hide_bets_history}
        />
      </Box>
    </Container>
  );
};
