// theme/utils.ts
import { alpha } from "@mui/material";

export const buildColorScale = (main) => ({
  main,
  lighter: alpha(main, 0.15),
  light: alpha(main, 0.3),
  dark: alpha(main, 0.8),
  darker: alpha(main, 0.9),
});

