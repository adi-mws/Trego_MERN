// theme/AppThemeProvider.jsx
import { ThemeProvider, CssBaseline } from "@mui/material";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { buildTheme } from "./buildTheme";

const AppThemeProvider = ({ children, type = "dashboard" }) => {
  const { preferences } = useSelector((state) => state.userGlobal);

  const theme = useMemo(() => {
    
    if (type === "marketing") {
      return buildTheme("light", "#1976d2");
    }

    return buildTheme(preferences?.theme?.mode, preferences?.theme?.accentColor);
  }, [type, preferences?.theme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;