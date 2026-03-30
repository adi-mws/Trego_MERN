import {
  Box,
  Button,
  Typography,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
// import { useGlobalSearch } from "@/components/features/search/useGlobalSearch";

export default function GlobalSearchBar() {
//   const { openSearch } = useGlobalSearch();
  const theme = useTheme();
  return (
    <Button
      onClick={() => {}}
      sx={{
        textTransform: "none",
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        px: 2,
        py: 1,
        minWidth: 260,
        justifyContent: "flex-start",
        color: "text.secondary",
      }}
    >
      {/* Left side */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <SearchIcon fontSize="small" />
        <Typography variant="body2">Search</Typography>
      </Box>

      {/* Right side */}
      <Box
        sx={{
          ml: "auto",
          fontSize: 10,
          px: 0.75,
          py: 0.25,
          borderRadius: 1,
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.06)",
        }}
      >
        Ctrl + K
      </Box>
    </Button>
  );
}
