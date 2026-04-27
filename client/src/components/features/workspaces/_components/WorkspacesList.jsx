
import {
  Box,
  ButtonBase,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  LinearProgress,
  Stack,
  Avatar,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useRef } from "react";
import { WORKSPACE_ROUTES } from "../../.././../lib/routes";
import { formatDate } from "../../../../lib/date";
import EmptyStateComponent from "../../../global/EmptyStateComponent";
import { useNavigate } from "react-router-dom";
import { useHeader } from "../../../../contexts/HeaderContext";
import { getImageUrl } from "../../../../utils/image.utils";

const getHealthColor = (value) => {
  if (value >= 75) return "success";
  if (value >= 40) return "warning";
  return "error";
};

const formatMemberCount = (count) => {
  if (count < 30) return `${count} members`;
  return `${Math.floor(count / 5) * 5}+`;
};

const AVATAR_COLORS = [
  "#3f51b5",
  "#009688",
  "#e91e63",
  "#ff9800",
  "#607d8b",
];

function WorkspaceCard({ ws, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: "100%",
        textAlign: "left",
        borderRadius: 3,
        overflow: "hidden",
        display: "block",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          p: 1.75,
          borderRadius: 3,
          transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: 1,
            transform: "translateY(-1px)",
          },
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar src={ws.avatar ?? undefined} sx={{ width: 40, height: 40, flexShrink: 0 }}>
              {!ws.avatar && ws.name[0]?.toUpperCase()}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body1" fontWeight={600} noWrap>
                {ws.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(new Date(ws.createdAt))}
              </Typography>
            </Box>
          </Stack>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                Health
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {ws.healthScore ?? 0}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={ws.healthScore ?? 0}
              color={getHealthColor(ws.healthScore ?? 0)}
              sx={{ height: 8, borderRadius: 999 }}
            />
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Stack direction="row" spacing={-0.75} alignItems="center">
              {(ws.members ?? []).slice(0, 4).map((member, index) => (
                <Avatar
                  key={member.id}
                  src={getImageUrl(member.avatar ?? undefined)}
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: 11,
                    fontWeight: 600,
                    border: "2px solid",
                    borderColor: "background.paper",
                    bgcolor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                  }}
                >
                  {!member.avatar && member.name?.[0]?.toUpperCase()}
                </Avatar>
              ))}
            </Stack>

            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontSize: 11,
                bgcolor: "action.hover",
                color: "text.secondary",
                whiteSpace: "nowrap",
              }}
            >
              {formatMemberCount(ws.totalMembers ?? 0)}
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </ButtonBase>
  );
}

export default function WorkspacesList({
  workspaces,
  view = "card",
  scrollRootRef,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) {
  const { setHeaderTitle } = useHeader();
  const navigate = useNavigate();
  const loadMoreRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const effectiveView = isMobile ? "card" : view;

  useEffect(() => {
    setHeaderTitle("Your Workspaces");
  }, [setHeaderTitle])

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1, root: scrollRootRef?.current || null }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, scrollRootRef]);

  if (!workspaces.length) {
    return <EmptyStateComponent />;
  }

  const renderWorkspace = (ws) => (
    <WorkspaceCard
      key={ws.id}
      ws={ws}
      onClick={() => navigate(WORKSPACE_ROUTES.workspace(ws.slug))}
    />
  );

  return (
    <Box>
      {effectiveView === "card" ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(auto-fit, minmax(260px, 1fr))",
            },
            gap: 1.5,
          }}
        >
          {workspaces.map(renderWorkspace)}
        </Box>
      ) : (
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  Workspace
                </Typography>
              </TableCell>

              <TableCell width={140}>
                <Typography variant="body2" color="text.secondary">
                  Health
                </Typography>
              </TableCell>

              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Typography variant="body2" color="text.secondary">
                  Members
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {workspaces.map((ws) => (
              <TableRow
                key={ws.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() =>
                  navigate(WORKSPACE_ROUTES.workspace(ws.slug))
                }
              >
                {/* Workspace */}
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={ws.avatar ?? undefined} sx={{ width: 36, height: 36 }}>
                      {!ws.avatar && ws.name[0]?.toUpperCase()}
                    </Avatar>

                    <Typography variant="body2" fontWeight={500}>
                      {ws.name}
                    </Typography>
                  </Stack>
                </TableCell>

                {/* Health */}
                <TableCell>
                  <Stack spacing={0.5}>
                    <LinearProgress
                      variant="determinate"
                      value={ws.healthScore ?? 0}
                      color={getHealthColor(ws.healthScore ?? 0)}
                    />

                    <Typography variant="body2" color="text.secondary">
                      {ws.healthScore ?? 0}%
                    </Typography>
                  </Stack>
                </TableCell>

                {/* Created */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(new Date(ws.createdAt))}
                  </Typography>
                </TableCell>

                {/* Members */}
                <TableCell align="center">
                  <Stack
                    direction="row"
                    spacing={-0.75}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {(ws.members ?? []).slice(0, 4).map((member, index) => (
                      <Avatar
                        key={member.id}
                        src={getImageUrl(member.avatar ?? undefined)}
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: 11,
                          fontWeight: 600,
                          border: "2px solid",
                          borderColor: "background.paper",
                          bgcolor:
                            AVATAR_COLORS[index % AVATAR_COLORS.length],
                        }}
                      >
                        {!member.avatar && member.name?.[0]?.toUpperCase()}
                      </Avatar>
                    ))}

                    <Box
                      sx={{
                        ml: 1,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: 11,
                        bgcolor: "action.hover",
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatMemberCount(ws.totalMembers ?? 0)}
                    </Box>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Box ref={loadMoreRef} sx={{ height: 1, width: 1 }} />

      {isFetchingNextPage && <LinearProgress sx={{ mt: 1 }} />}
    </Box>
  );
}
