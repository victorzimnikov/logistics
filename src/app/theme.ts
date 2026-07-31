import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#246BFD",
      dark: "#174DBD",
      light: "#EAF1FF",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#12A594",
    },
    background: {
      default: "#F4F6FA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#162238",
      secondary: "#637083",
    },
    divider: "#E4E8EF",
    success: {
      main: "#168A65",
    },
    warning: {
      main: "#D97706",
    },
    error: {
      main: "#D64545",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Manrope", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontSize: "2rem",
      fontWeight: 800,
      letterSpacing: "-0.04em",
    },
    h2: {
      fontSize: "1.35rem",
      fontWeight: 800,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontSize: "1rem",
      fontWeight: 800,
    },
    // Мелкая шкала. body2 — основной текст карточек и таблиц,
    // caption — второстепенные подписи, overline — заголовки секций.
    // lineHeight держим единым, чтобы строки в таблицах не разъезжались.
    body2: {
      fontSize: 13,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      lineHeight: 1.5,
    },
    overline: {
      fontSize: 11,
      fontWeight: 800,
      lineHeight: 1.5,
      letterSpacing: "0.02em",
      // В интерфейсе много кириллицы, капс её ломает.
      textTransform: "none",
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
  components: {
    MuiTypography: {
      defaultProps: {
        // Мелкие варианты по умолчанию рендерятся в span; нам нужен
        // блочный поток, иначе вертикальные отступы не применяются.
        variantMapping: {
          body2: "p",
          caption: "p",
          overline: "p",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 10,
          paddingInline: 18,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E4E8EF",
          boxShadow: "0 1px 2px rgba(18, 34, 58, 0.03)",
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#FFFFFF",
        },
      },
    },
  },
});
