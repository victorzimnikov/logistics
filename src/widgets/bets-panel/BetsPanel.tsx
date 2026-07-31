import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Card,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { auctionsApi } from "@/shared/api/auctions/client";
import { auctionQueryKeys } from "@/shared/api/auctions/queryKeys";
import type { Bet } from "@/shared/api/auctions/types";
import { formatFullDate, formatMoney } from "@/shared/lib/format";
import { EmptyState, ErrorState } from "@/shared/ui/FeedbackState";

const BetStatus = ({ bet }: { bet: Bet }) => {
  if (bet.is_cancelled) {
    return (
      <Chip size="small" label="Отменена" color="error" variant="outlined" />
    );
  }

  if (bet.is_winner) {
    return (
      <Chip
        size="small"
        label="Победитель"
        color="success"
        icon={<EmojiEventsRoundedIcon />}
      />
    );
  }

  if (bet.is_mine) {
    return <Chip size="small" label="Моя ставка" color="primary" />;
  }

  return <Chip size="small" label="Активна" variant="outlined" />;
};

const MobileBetCard = ({ bet }: { bet: Bet }) => {
  return (
    <Box sx={{ py: 2 }}>
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              textDecoration: bet.is_cancelled ? "line-through" : "none",
            }}
          >
            {bet.carrier.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
            ИНН {bet.carrier.inn} · {formatFullDate(bet.created_at)}
          </Typography>
        </Box>
        <Typography sx={{ fontWeight: 800, whiteSpace: "nowrap" }}>
          #{bet.rating_place}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{ mt: 1.5 }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800 }}>
            {formatMoney(bet.price_with_vat)}
          </Typography>
          <Typography variant="overline" color="text.secondary">
            {formatMoney(bet.price_without_vat)} без НДС
          </Typography>
        </Box>
        <BetStatus bet={bet} />
      </Stack>
      {bet.cancellation_reason && (
        <Alert severity="error" variant="outlined" sx={{ mt: 1.5, py: 0 }}>
          {bet.cancellation_reason}
        </Alert>
      )}
    </Box>
  );
};

type BetsPanelProps = {
  auctionUuid: string;
  hidden: boolean;
};

export const BetsPanel = ({ auctionUuid, hidden }: BetsPanelProps) => {
  const includeCancelled = true;
  const query = useQuery({
    queryKey: auctionQueryKeys.bets(auctionUuid, includeCancelled),
    queryFn: ({ signal }) =>
      auctionsApi.getBets(auctionUuid, includeCancelled, signal),
    enabled: !hidden,
  });

  if (hidden) {
    return (
      <Card sx={{ p: 3 }}>
        <Stack alignItems="center" textAlign="center" sx={{ py: 3 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              display: "grid",
              placeItems: "center",
              borderRadius: 3,
              bgcolor: "#EEF2F7",
              color: "text.secondary",
              mb: 1.5,
            }}
          >
            <LockOutlinedIcon />
          </Box>
          <Typography variant="h2">История ставок скрыта</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 440 }}>
            Организатор ограничил просмотр участников и цен до завершения
            торгов.
          </Typography>
        </Stack>
      </Card>
    );
  }

  if (query.isPending) {
    return (
      <Card sx={{ p: 3 }}>
        <Stack spacing={1.5}>
          {[1, 2, 3].map((item) => (
            <Box
              key={item}
              sx={{ height: 58, bgcolor: "#F1F3F7", borderRadius: 2 }}
            />
          ))}
        </Stack>
      </Card>
    );
  }

  if (query.isError) {
    return (
      <Card>
        <ErrorState compact onRetry={() => void query.refetch()} />
      </Card>
    );
  }

  return (
    <Card sx={{ overflow: "hidden" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ px: { xs: 2, md: 3 }, pt: 2.5, pb: 2 }}
      >
        <Box>
          <Typography variant="h2">История ставок</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
            Все ставки в порядке текущего рейтинга
          </Typography>
        </Box>
        <Chip
          icon={<PeopleAltOutlinedIcon />}
          label={`${query.data.participants_count} участников`}
          variant="outlined"
        />
      </Stack>
      <Divider />

      {query.data.items.length === 0 ? (
        <EmptyState
          title="Ставок пока нет"
          description="Станьте первым участником этого аукциона."
        />
      ) : (
        <>
          <Box sx={{ display: { xs: "block", md: "none" }, px: 2 }}>
            <Stack divider={<Divider flexItem />}>
              {query.data.items.map((bet) => (
                <MobileBetCard bet={bet} key={bet.bet_uuid} />
              ))}
            </Stack>
          </Box>
          <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8F9FC" }}>
                  <TableCell>Место</TableCell>
                  <TableCell>Перевозчик</TableCell>
                  <TableCell>Цена с НДС</TableCell>
                  <TableCell>Без НДС</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell align="right">Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {query.data.items.map((bet) => (
                  <TableRow
                    key={bet.bet_uuid}
                    sx={{
                      opacity: bet.is_cancelled ? 0.62 : 1,
                      bgcolor: bet.is_mine
                        ? "rgba(36, 107, 253, 0.035)"
                        : "inherit",
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 800 }}>
                        #{bet.rating_place}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                        {bet.carrier.name}
                      </Typography>
                      <Typography variant="overline" color="text.secondary">
                        ИНН {bet.carrier.inn}
                      </Typography>
                      {bet.cancellation_reason && (
                        <Typography variant="overline"
                          color="error"
                          sx={{ mt: 0.4 }}
                        >
                          {bet.cancellation_reason}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>
                      {formatMoney(bet.price_with_vat)}
                    </TableCell>
                    <TableCell>{formatMoney(bet.price_without_vat)}</TableCell>
                    <TableCell>{formatFullDate(bet.created_at)}</TableCell>
                    <TableCell align="right">
                      <BetStatus bet={bet} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Card>
  );
};
