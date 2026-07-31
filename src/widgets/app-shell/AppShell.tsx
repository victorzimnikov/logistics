import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { Outlet } from "@tanstack/react-router";
import { AppLogo } from "@/shared/ui/AppLogo";

export const AppShell = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(14px)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
            <AppLogo />
            <Stack
              spacing={1.5}
              direction="row"
              alignItems="center"
              sx={{ ml: "auto" }}
            >
              <Stack spacing={0.5} direction="row" alignItems="center">
                <Tooltip title="Помощь">
                  <IconButton
                    aria-label="Помощь"
                    sx={{ display: { xs: "none", sm: "inline-flex" } }}
                  >
                    <HelpOutlineRoundedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Уведомления">
                  <IconButton aria-label="Уведомления">
                    <Badge variant="dot" color="primary">
                      <NotificationsNoneRoundedIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                sx={{ ml: { xs: 0.5, sm: 1.5 } }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#17233A",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  ВК
                </Avatar>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    Вектор Карго
                  </Typography>
                  <Typography variant="overline" color="text.secondary">
                    Перевозчик
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>
      <Outlet />
    </Box>
  );
};
