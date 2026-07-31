import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import {
  AUCTION_FILTER_TYPES,
  AUCTION_STATUS_FILTERS,
} from "@/shared/api/auctions/types";
import { CITIES } from "@/shared/config/cities";
import {
  AUCTION_STATUS_LABELS,
  AUCTION_TYPE_LABELS,
} from "@/shared/config/labels";
import type { AuctionSearch } from "@/features/auction-filters/model/searchParams";

type AuctionFiltersProps = {
  value: AuctionSearch;
  onApply: (value: AuctionSearch) => void;
  onReset: () => void;
  onClose?: () => void;
};

export const AuctionFilters = ({
  value,
  onApply,
  onReset,
  onClose,
}: AuctionFiltersProps) => {
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  // Сброс черновика при изменении внешних параметров поиска:
  // корректировка состояния во время рендера вместо useEffect.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(value);
  }

  const update = <Key extends keyof AuctionSearch>(
    key: Key,
    nextValue: AuctionSearch[Key],
  ) => setDraft((current) => ({ ...current, [key]: nextValue, page: 1 }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onApply(draft);
    onClose?.();
  };

  const selectBoolean = (value: unknown): boolean | undefined => {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return undefined;
  };

  const handleStatuses = (event: SelectChangeEvent<number[]>) => {
    const next = event.target.value;

    update(
      "statuses",
      (typeof next === "string"
        ? next.split(",").map(Number)
        : next) as AuctionSearch["statuses"],
    );
  };

  return (
    <Box
      component="form"
      onSubmit={submit}
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
          <TuneRoundedIcon color="primary" />
          <Typography variant="h3">Фильтры</Typography>
        </Stack>

        <Stack spacing={2}>
          <TextField
            label="Номер заявки"
            placeholder="Например, GR-24081"
            value={draft.cargo_num ?? ""}
            onChange={(event) =>
              update("cargo_num", event.target.value || undefined)
            }
            fullWidth
            size="small"
          />

          <FormControl fullWidth size="small">
            <InputLabel>Статус</InputLabel>
            <Select
              multiple
              label="Статус"
              value={draft.statuses}
              onChange={handleStatuses}
              renderValue={(selected) =>
                selected
                  .map((status) => {
                    const option = AUCTION_STATUS_FILTERS.find(
                      (item) => item.value === status,
                    );
                    return option
                      ? AUCTION_STATUS_LABELS[option.status]
                      : String(status);
                  })
                  .join(", ")
              }
            >
              {AUCTION_STATUS_FILTERS.map((option) => (
                <MenuItem value={option.value} key={option.value}>
                  <Checkbox
                    checked={draft.statuses.includes(option.value)}
                    size="small"
                  />
                  <ListItemText
                    primary={AUCTION_STATUS_LABELS[option.status]}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Тип аукциона</InputLabel>
            <Select
              label="Тип аукциона"
              value={draft.auc_type ?? ""}
              onChange={(event) =>
                update(
                  "auc_type",
                  (event.target.value ||
                    undefined) as AuctionSearch["auc_type"],
                )
              }
            >
              <MenuItem value="">Все типы</MenuItem>
              {AUCTION_FILTER_TYPES.map((type) => (
                <MenuItem value={type} key={type}>
                  {AUCTION_TYPE_LABELS[type]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider>
            <Typography variant="overline" color="text.secondary">
              МАРШРУТ
            </Typography>
          </Divider>

          <FormControl fullWidth size="small">
            <InputLabel>Город погрузки</InputLabel>
            <Select
              label="Город погрузки"
              value={draft.load_city ?? ""}
              onChange={(event) =>
                update("load_city", event.target.value || undefined)
              }
            >
              <MenuItem value="">Любой город</MenuItem>
              {CITIES.map((city) => (
                <MenuItem value={city.uuid} key={city.uuid}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Город выгрузки</InputLabel>
            <Select
              label="Город выгрузки"
              value={draft.unload_city ?? ""}
              onChange={(event) =>
                update("unload_city", event.target.value || undefined)
              }
            >
              <MenuItem value="">Любой город</MenuItem>
              {CITIES.map((city) => (
                <MenuItem value={city.uuid} key={city.uuid}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1.25}>
            <TextField
              label="Погрузка от"
              type="date"
              value={draft.loading_date_from ?? ""}
              onChange={(event) =>
                update("loading_date_from", event.target.value || undefined)
              }
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="До"
              type="date"
              value={draft.loading_date_to ?? ""}
              onChange={(event) =>
                update("loading_date_to", event.target.value || undefined)
              }
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          <Divider>
            <Typography variant="overline" color="text.secondary">
              УЧАСТИЕ И ЦЕНА
            </Typography>
          </Divider>

          <FormControl fullWidth size="small">
            <InputLabel>Доступность</InputLabel>
            <Select
              label="Доступность"
              value={
                draft.is_available === undefined
                  ? ""
                  : String(draft.is_available)
              }
              onChange={(event) =>
                update("is_available", selectBoolean(event.target.value))
              }
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="true">Доступно для ставки</MenuItem>
              <MenuItem value="false">Недоступно</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Моё участие</InputLabel>
            <Select
              label="Моё участие"
              value={
                draft.is_bidder === undefined ? "" : String(draft.is_bidder)
              }
              onChange={(event) =>
                update("is_bidder", selectBoolean(event.target.value))
              }
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="true">Есть моя ставка</MenuItem>
              <MenuItem value="false">Не участвую</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1.25}>
            <TextField
              label="Цена от, ₽"
              type="number"
              value={draft.price_from ?? ""}
              onChange={(event) =>
                update(
                  "price_from",
                  event.target.value ? Number(event.target.value) : undefined,
                )
              }
              fullWidth
              size="small"
            />
            <TextField
              label="До, ₽"
              type="number"
              value={draft.price_to ?? ""}
              onChange={(event) =>
                update(
                  "price_to",
                  event.target.value ? Number(event.target.value) : undefined,
                )
              }
              fullWidth
              size="small"
            />
          </Stack>
        </Stack>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          pt: 2.5,
          mt: 2.5,
          borderTop: 1,
          borderColor: "divider",
          position: "sticky",
          bottom: 0,
          bgcolor: "background.paper",
        }}
      >
        <Button type="submit" variant="contained" fullWidth>
          Показать
        </Button>
        <Button
          aria-label="Сбросить фильтры"
          variant="outlined"
          onClick={() => {
            onReset();
            onClose?.();
          }}
          sx={{ minWidth: 44, px: 1 }}
        >
          <RestartAltRoundedIcon />
        </Button>
      </Stack>
    </Box>
  );
};
