// theme/buildTheme.ts
import { createTheme } from "@mui/material";
import { buildColorScale } from "./util";


export function buildTheme(mode, primaryColor) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,

      primary: buildColorScale(primaryColor),

      secondary: {
        main: "#f50057",
      },

      success: buildColorScale("#2e7d32"),
      error: buildColorScale("#d32f2f"),

      background: {
        default: isDark ? "#0f0f0f" : "#ffffff",
        paper: isDark ? "#1a1a1a" : "#ffffff",
      },

      text: {
        primary: isDark ? "#f5f5f5" : "#1a1a1a",
        secondary: isDark ? "#b0b0b0" : "#555555",
      },

      divider: isDark
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(0, 0, 0, 0.12)",
    },

    typography: {
      fontFamily: "Inter, sans-serif",

      body1: {
        fontSize: "0.95rem", 
        lineHeight: 1.5,
        fontWeight: 500,
        color: isDark ? "#e0e0e0" : "#2e2e2e",
      },

      body2: {
        fontSize: "0.85rem", // 12px
        lineHeight: 1.4,
        fontWeight: 500,
        color: isDark ? "#b0b0b0" : "#555555",
      },

      body3: {
        fontSize: "0.75rem", // 11px
        lineHeight: 1.3,
        fontWeight: 500,
        letterSpacing: "0.02em",
        opacity: 0.85,
      },

    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark
              ? "#444 #1a1a1a"
              : "#d0d0d0 #f5f5f5",

            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: isDark ? "#444" : "#d0d0d0",
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: isDark ? "#555" : "#bfbfbf",
            },
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            padding: ".7em 2.5em",
            borderRadius: 10,
            boxShadow: 'none'
          },
        },
      },
      // MuiCard: {
      //   styleOverrides: {
      //     root: {
      //       background: "linear-gradient(135deg, #1e1e2f, #2a2a40)",
      //     }
      //   }
      // },

      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          size: "medium",
          InputLabelProps: {
            shrink: true,
          },
          InputProps: {
            sx: {
              borderRadius: 1,
              fontSize: "0.875rem",
            },
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          input: {
            fontSize: '0.8rem',
            padding: '.9em 1em',

            '&::placeholder': {
              fontSize: '0.8rem',
              opacity: 0.7,
            },
          },
        },
      },

      MuiSvgIcon: {
        styleOverrides: {
          root: {
            fill: "currentColor",
          },
        },
        defaultProps: {
          htmlColor: "inherit",
        },
      },
    },
  });
}
``