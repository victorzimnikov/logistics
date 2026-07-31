import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import type { AuctionListItem } from "@/shared/api/auctions/types";
import { mapAuctionToCard } from "../model/viewModel";

const actionLabels = {
  makeBet: "Сделать ставку",
  changeBet: "Изменить ставку",
  viewBets: "Смотреть ставки",
  disabled: "Ставки недоступны",
} as const;

type AuctionCardProps = {
  auction: AuctionListItem;
  onOpen: () => void;
  onAction: () => void;
  onPrefetch: () => void;
};

export const AuctionCard = ({
  auction,
  onOpen,
  onAction,
  onPrefetch,
}: AuctionCardProps) => {
  const view = mapAuctionToCard(auction);
  const active = view.statusCode === "Auction";
  const positive = ["Leading", "Winner"].includes(view.tradingStatusCode);

  return (
    <Card
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      sx={{
        overflow: "hidden",
        transition:
          "border-color .2s ease, box-shadow .2s ease, transform .2s ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 10px 30px rgba(25, 44, 78, 0.08)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1.25}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography sx={{ fontWeight: 800, fontSize: 17 }}>
              {view.number}
            </Typography>
            <Chip
              label={view.type}
              size="small"
              sx={{ bgcolor: "#EEF2F7", color: "text.secondary" }}
            />
            <Chip
              label={view.status}
              size="small"
              color={active ? "primary" : "default"}
              variant={active ? "filled" : "outlined"}
            />
          </Stack>
          <Chip
            icon={positive ? <CheckCircleRoundedIcon /> : <GavelRoundedIcon />}
            label={view.tradingStatus}
            size="small"
            sx={{
              bgcolor: positive ? "#E8F6F0" : "#FFF5E8",
              color: positive ? "#137455" : "#A75A06",
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1.4fr) minmax(220px, .7fr)",
            },
            gap: { xs: 2, md: 4 },
            mt: 2.5,
          }}
        >
          <Box>
            <Stack direction="row" alignItems="flex-start" spacing={1.5}>
              <Box
                sx={{
                  mt: 0.2,
                  width: 34,
                  height: 34,
                  flex: "0 0 auto",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.light",
                  color: "primary.main",
                  borderRadius: 2.5,
                }}
              >
                <LocalShippingOutlinedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    sx={{ fontWeight: 800, fontSize: { xs: 16, md: 18 } }}
                  >
                    {view.fromCity}
                  </Typography>
                  <Box
                    sx={{
                      height: 1,
                      flex: 1,
                      minWidth: 25,
                      maxWidth: 90,
                      bgcolor: "divider",
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        right: 0,
                        top: -3,
                        width: 7,
                        height: 7,
                        borderTop: "1px solid #A8B1BF",
                        borderRight: "1px solid #A8B1BF",
                        transform: "rotate(45deg)",
                      },
                    }}
                  />
                  <Typography
                    sx={{ fontWeight: 800, fontSize: { xs: 16, md: 18 } }}
                  >
                    {view.toCity}
                  </Typography>
                </Stack>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 0.5, sm: 3 }}
                  sx={{ mt: 0.75 }}
                >
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <CalendarMonthRoundedIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {view.loadingDate} → {view.unloadingDate}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Inventory2OutlinedIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {view.cargo} · {view.cargoMeta}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              pl: { md: 3 },
              borderLeft: { md: 1 },
              borderColor: { md: "divider" },
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700 }}
            >
              Текущая цена
            </Typography>
            <Stack
              direction="row"
              alignItems="baseline"
              spacing={1.25}
              sx={{ mt: 0.3 }}
            >
              <Typography
                sx={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.04em" }}
              >
                {view.price}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {view.pricePerKm}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
              {view.step && (
                <Typography variant="caption" color="text.secondary">
                  {view.step}
                </Typography>
              )}
              <Typography
                variant="caption"
                color={view.hasMyBet ? "success.main" : "text.secondary"}
                sx={{ fontWeight: 700 }}
              >
                {view.hasMyBet ? "● Моя ставка есть" : "○ Моей ставки нет"}
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Divider />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: { xs: 2, md: 2.5 }, py: 1.35, bgcolor: "#FBFCFE" }}
      >
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={onOpen}
          endIcon={<ArrowForwardRoundedIcon />}
        >
          Подробнее
        </Button>
        <Button
          size="small"
          variant={view.action === "viewBets" ? "outlined" : "contained"}
          disabled={view.action === "disabled"}
          onClick={onAction}
        >
          {actionLabels[view.action]}
        </Button>
      </Stack>
    </Card>
  );
};
