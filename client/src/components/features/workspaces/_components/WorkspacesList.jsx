
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  LinearProgress,
  Stack,
  Avatar,
} from "@mui/material";
import { useEffect, useRef } from "react";
import { WORKSPACE_ROUTES } from "../../.././../lib/routes";
import { formatDate } from "../../../../lib/date";
import EmptyStateComponent from "../../../global/EmptyStateComponent";
import { useNavigate } from "react-router-dom";
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

export default function WorkspacesList({
  // workspaces, // todo: dummy comment (remove it when workspaces are fetched)
  fetchNextPage, 
  hasNextPage,
  isFetchingNextPage,
}) {
  const navigate = useNavigate();
  const loadMoreRef = useRef(null);
  const workspaces = [] // todo: dummy for the ui 
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!workspaces.length) {
    return <EmptyStateComponent />;
  }

  return (
    <Box>
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
                    value={ws.health ?? 0}
                    color={getHealthColor(ws.health ?? 0)}
                  />

                  <Typography variant="body2" color="text.secondary">
                    {ws.health ?? 0}%
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
                  {(ws.membersPreview ?? []).slice(0, 4).map((member, index) => (
                    <Avatar
                      key={member.id}
                      src={member.avatar ?? undefined}
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
                    {formatMemberCount(ws.memberCount ?? 0)}
                  </Box>
                </Stack>
              </TableCell>
            </TableRow>
          ))}

          {/* Sentinel row for infinite scroll */}
          <TableRow ref={loadMoreRef}>
            <TableCell colSpan={4}>
              {isFetchingNextPage && <LinearProgress />}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}