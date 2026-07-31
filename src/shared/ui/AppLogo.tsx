import { Box, Typography } from "@mui/material";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";

export const AppLogo = () => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          bgcolor: "primary.main",
          color: "white",
          boxShadow: "0 8px 20px rgba(36, 107, 253, 0.28)",
        }}
      >
        <LocalShippingRoundedIcon sx={{ fontSize: 21 }} />
      </Box>
      <Typography
        variant="h6"
        sx={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.04em" }}
      >
        Logistics<span style={{ color: "#246BFD" }}>Auction</span>
      </Typography>
    </Box>
  );
};
