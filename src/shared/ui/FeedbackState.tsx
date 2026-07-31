import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      sx={{ minHeight: 300, px: 3, py: 6 }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          display: "grid",
          placeItems: "center",
          borderRadius: 4,
          bgcolor: "primary.light",
          color: "primary.main",
          mb: 2,
        }}
      >
        <SearchOffRoundedIcon fontSize="large" />
      </Box>
      <Typography variant="h2" sx={{ mb: 0.75 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button sx={{ mt: 2.5 }} variant="outlined" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
};

export const ErrorState = ({
  onRetry,
  compact = false,
}: {
  onRetry: () => void;
  compact?: boolean;
}) => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      sx={{ minHeight: compact ? 210 : 360, px: 3, py: 5 }}
    >
      <ErrorOutlineRoundedIcon color="error" sx={{ fontSize: 48, mb: 1.5 }} />
      <Typography variant="h2">Что-то пошло не так</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75 }}>
        Не удалось загрузить данные. Попробуйте ещё раз.
      </Typography>
      <Button variant="outlined" sx={{ mt: 2.5 }} onClick={onRetry}>
        Повторить
      </Button>
    </Stack>
  );
};

export const PageLoader = () => {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 420 }}>
      <CircularProgress size={36} thickness={4} />
      <Typography color="text.secondary" sx={{ mt: 2, fontSize: 14 }}>
        Загружаем аукцион…
      </Typography>
    </Stack>
  );
};
