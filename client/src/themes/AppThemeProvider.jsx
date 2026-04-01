// theme/AppThemeProvider.jsx
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { buildTheme } from "./buildTheme";

const AppThemeProvider = ({ children, type = "dashboard" }) => {
  const { user } = useSelector((state) => state.userGlobal);

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const mode =
    user?.preferences?.theme === "system"
      ? (prefersDark ? "dark" : "light")
      : user?.preferences?.theme || "light";

  const accentColor = user?.preferences?.accentColor || "#1976d2";
  const theme = useMemo(() => {
    if (type === "marketing") {
      return buildTheme("light", "#1976d2");
    }

    return buildTheme(mode, accentColor);
  }, [type, mode, accentColor]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;