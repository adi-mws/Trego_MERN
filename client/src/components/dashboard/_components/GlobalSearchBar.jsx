import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { callApi } from "../../../api/api";

const emptyResults = {
  projects: [],
  projectRoles: [],
  tasks: [],
  workflows: [],
};

const typeConfig = {
  project: {
    label: "Projects",
    icon: FolderOutlinedIcon,
    tint: "primary.main",
    hint: "Project spaces and briefs",
  },
  task: {
    label: "Tasks",
    icon: TaskAltOutlinedIcon,
    tint: "success.main",
    hint: "Task titles and descriptions",
  },
  workflow: {
    label: "Workflows",
    icon: AccountTreeOutlinedIcon,
    tint: "warning.main",
    hint: "Workflow versions and copies",
  },
  role: {
    label: "Project Roles",
    icon: BadgeOutlinedIcon,
    tint: "info.main",
    hint: "Project role names",
  },
};

function SearchResultRow({ item, onClick }) {
  const config = typeConfig[item.type] || typeConfig.project;
  const Icon = config.icon;

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        alignItems: "flex-start",
        px: 1.25,
        py: 1,
      }}
    >
      <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            bgcolor: "background.default",
            color: config.tint,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
      </ListItemIcon>
      <ListItemText
        primary={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" fontWeight={700}>
              {item.title}
            </Typography>
            <Chip size="small" label={config.label} variant="outlined" sx={{ height: 20 }} />
          </Stack>
        }
        secondary={
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
            {item.subtitle || config.hint}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default function GlobalSearchBar() {
  const { workspaceSlug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(emptyResults);
  const [featuredItems, setFeaturedItems] = useState([]);
  const inputRef = useRef(null);
  const requestIdRef = useRef(0);

  const hasWorkspace = Boolean(workspaceSlug);

  const flattenedCount = useMemo(
    () =>
      Object.values(results).reduce(
        (count, items) => count + (Array.isArray(items) ? items.length : 0),
        0
      ),
    [results]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (!isShortcut) return;
      event.preventDefault();
      setOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 60);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open || !hasWorkspace) return;

    const timer = window.setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setLoading(true);

      const res = await callApi({
        method: "get",
        url: `/search/workspace/${workspaceSlug}`,
        params: { q: query.trim() },
      });

      if (requestId !== requestIdRef.current) return;

      if (res.success) {
        setResults(res.data?.data?.results || emptyResults);
        setFeaturedItems(res.data?.data?.featured || []);
      } else {
        setResults(emptyResults);
        setFeaturedItems([]);
      }

      setLoading(false);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [query, open, hasWorkspace, workspaceSlug]);

  const handleOpen = () => {
    if (!hasWorkspace) return;
    setOpen(true);
  };

  const handleClose = () => {
    requestIdRef.current += 1;
    setOpen(false);
    setQuery("");
    setResults(emptyResults);
    setFeaturedItems([]);
    setLoading(false);
  };

  const handleNavigate = (item) => {
    if (!item?.path) return;
    handleClose();
    navigate(item.path);
  };

  const sections = [
    { key: "projects", title: "Projects" },
    { key: "projectRoles", title: "Project Roles" },
    { key: "tasks", title: "Tasks" },
    { key: "workflows", title: "Workflows" },
  ];

  return (
    <>
      <Button
        onClick={handleOpen}
        disabled={!hasWorkspace}
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
          opacity: hasWorkspace ? 1 : 0.75,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SearchIcon fontSize="small" />
          <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
            Search
          </Typography>
        </Box>

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

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            width: "min(960px, calc(100vw - 16px))",
            height: { xs: "calc(100vh - 16px)", sm: "min(78vh, 720px)" },
            maxHeight: { xs: "calc(100vh - 16px)", sm: "78vh" },
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            fontFamily: theme.typography.fontFamily,
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: theme.typography.fontFamily,
          }}
        >
          <Box sx={{ p: 2.25, pb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                >
                  <SearchIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ fontFamily: theme.typography.fontFamily }}>
                    Search everything
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    Projects, roles, tasks, and workflows in this workspace.
                  </Typography>
                </Box>
                <Chip label="Ctrl + K" variant="outlined" size="small" />
              </Stack>

              <TextField
                inputRef={inputRef}
                fullWidth
                autoFocus
                placeholder="Type to search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ fontFamily: theme.typography.fontFamily }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "300px 1fr" },
              gap: 2,
              p: 2,
              bgcolor: "background.default",
              overflow: "hidden",
              fontFamily: theme.typography.fontFamily,
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={800}>
                  Featured items
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mixed recent items across the workspace.
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  pr: 0.5,
                }}
              >
                {featuredItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Open the search to load recent items.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {featuredItems.map((item) => (
                      <SearchResultRow
                        key={`featured-${item.type}-${item.meta?.projectSlug || item.path}-${item.title}`}
                        item={item}
                        onClick={() => handleNavigate(item)}
                      />
                    ))}
                  </List>
                )}
              </Box>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                fontFamily: theme.typography.fontFamily,
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={800}>
                    Results
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {query.trim().length === 0
                      ? "Start typing to search"
                      : `${flattenedCount} result${flattenedCount === 1 ? "" : "s"} found`}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                  {sections.map((section) => (
                    <Chip key={section.key} label={section.title} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Stack>

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  pr: 0.5,
                }}
              >
                {!hasWorkspace ? (
                  <Typography variant="body2" color="text.secondary">
                    Open a workspace to search its projects, roles, tasks, and workflows.
                  </Typography>
                ) : loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress size={26} />
                  </Box>
                ) : query.trim().length === 0 ? (
                  <Box
                    sx={{
                      minHeight: { xs: 180, md: 320 },
                      display: "grid",
                      placeItems: "center",
                      textAlign: "center",
                      px: 2,
                    }}
                  >
                    <Stack spacing={1.25} alignItems="center" sx={{ maxWidth: 340 }}>
                      <Box
                        sx={{
                          width: 54,
                          height: 54,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "action.hover",
                          color: "primary.main",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <SearchIcon />
                      </Box>
                      <Typography variant="h6" fontWeight={800}>
                        Search across the workspace
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start typing to filter projects, roles, tasks, and workflows.
                      </Typography>
                    </Stack>
                  </Box>
                ) : flattenedCount === 0 ? (
                  <Box sx={{ py: 8, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      No results found for "{query.trim()}".
                    </Typography>
                  </Box>
                ) : (
                  sections.map((section, index) => {
                    const items = results[section.key] || [];
                    if (items.length === 0) return null;

                    return (
                      <Box key={section.key} sx={{ mb: index < sections.length - 1 ? 2 : 0 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={800}>
                            {section.title}
                          </Typography>
                          <Chip label={items.length} size="small" variant="outlined" />
                        </Stack>
                        <List disablePadding>
                          {items.map((item) => (
                            <SearchResultRow
                              key={`${item.type}-${item.meta?.projectSlug || item.path}-${item.title}`}
                              item={item}
                              onClick={() => handleNavigate(item)}
                            />
                          ))}
                        </List>
                      </Box>
                    );
                  })
                )}
              </Box>
            </Paper>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
