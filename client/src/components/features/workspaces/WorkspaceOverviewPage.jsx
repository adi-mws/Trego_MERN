import { useState, useCallback, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Stack,
  Button, Avatar, Chip, CircularProgress, Divider,
  LinearProgress, Tooltip,
  useTheme
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import {
  FolderOutlined, GroupOutlined,
  AddCircleOutline, ArrowForwardIos,
  FavoriteBorderOutlined, CheckCircleOutline,
  ErrorOutline, TimelineOutlined, LockOutlined
} from "@mui/icons-material";
import { WorkspaceInviteDialog } from "./_components/WorkspaceInviteDialog";
import CreateProjectDialog from "../projects/_components/CreateProjectDialog";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PROJECT_ROUTES, WORKSPACE_ROUTES } from "../../../lib/routes";
import { callApi } from "../../../api/api";
import { resolveWorkspaceRole } from "../../../utils/workspaceRole.utils";
import { isAdmin } from "../../../utils/permissions.utils";

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, onClick, subtitle }) {
  return (
    <Card
      variant="outlined"
      onClick={onClick}
      sx={{
        borderRadius: 3,
        cursor: onClick ? "pointer" : "default",
        transition: "0.2s",
        height: "100%",
        "&:hover": onClick ? { transform: "translateY(-2px)", boxShadow: 3 } : {},
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" mb={0.5}>{label}</Typography>
            <Typography variant="h4" fontWeight={700} color={color || "text.primary"}>{value ?? "—"}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary" mt={0.5} display="block">{subtitle}</Typography>}
          </Box>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color || "#666"}18`, color: color || "text.secondary" }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function WorkspaceOverviewPage() {
  const [workspaceInviteOpen, setWorkspaceInviteOpen] = useState(false);
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const workspace = useSelector(s => s.workspace);
  const authUser = useSelector(s => s.auth?.data);
  const projects = workspace.projects || [];
  const workspaceRole = resolveWorkspaceRole(workspace, authUser);
  const userIsAdmin = isAdmin(workspaceRole);

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    if (!workspace._id) return;
    await Promise.resolve();
    setLoading(true);
    const res = await callApi({ method: "get", url: `/workspaces/${workspace._id}/metrics` });
    if (res.success) setMetrics(res.data.data);
    setLoading(false);
  }, [workspace._id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchMetrics();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchMetrics]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, height: "100%", overflowY: "auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{workspace.name || "Workspace"}</Typography>
          <Typography variant="body2" color="text.secondary">
            {userIsAdmin ? "Workspace Health & Overview" : "Your Projects"}
          </Typography>
        </Box>
        {userIsAdmin && (
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<AddCircleOutline />}
              sx={{ borderRadius: 2 }}
              onClick={() => setCreateProjectDialogOpen(true)}
            >
              New Project
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddAltIcon />}
              sx={{ borderRadius: 2 }}
              onClick={() => setWorkspaceInviteOpen(true)}
            >
              Invite Member
            </Button>
          </Stack>
        )}
      </Stack>

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Workspace Health"
            value={loading ? "..." : `${metrics?.overallHealthScore ?? 0}/100`}
            icon={<FavoriteBorderOutlined />}
            color={metrics?.healthStatus === "HEALTHY" ? "#52c41a" : metrics?.healthStatus === "WARNING" ? "#faad14" : "#f5222d"}
            subtitle={loading ? "" : `Status: ${metrics?.healthStatus}`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Task Completion Rate"
            value={loading ? "..." : `${metrics?.taskCompletionRate ?? 0}%`}
            icon={<CheckCircleOutline />}
            color={theme?.palette?.primary?.main}
            subtitle={loading ? "" : `${metrics?.completedTasks ?? 0} / ${metrics?.totalTasks ?? 0} tasks done`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Overdue Tasks"
            value={loading ? "..." : metrics?.overdueTasks ?? 0}
            icon={<ErrorOutline />}
            color={metrics?.overdueTasks > 0 ? "#f5222d" : theme.palette.primary.main}
            subtitle="Past deadline"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Blocked Tasks"
            value={loading ? "..." : metrics?.blockedTasks ?? 0}
            icon={<TimelineOutlined />}
            color={metrics?.blockedTasks > 0 ? "#faad14" : theme.palette.primary.main}
            subtitle="Needs attention"
          />
        </Grid>
      </Grid>

      {/* ── Main Content ── */}
      <Grid container spacing={2}>
        {/* Projects list */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography fontWeight={600}>Recent Projects</Typography>
                <Chip label={`${projects.length} total`} size="small" />
              </Stack>

              {projects.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <FolderOutlined sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                  {userIsAdmin ? (
                    <>
                      <Typography color="text.secondary" variant="body2">No projects yet</Typography>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ mt: 2 }}
                        onClick={() => setCreateProjectDialogOpen(true)}
                      >
                        Create First Project
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography color="text.secondary" variant="body2" mb={0.5}>
                        You haven't been added to any projects yet
                      </Typography>
                      <Typography color="text.disabled" variant="caption">
                        Ask your workspace admin to add you to a project
                      </Typography>
                    </>
                  )}
                </Box>
              ) : (
                <Stack spacing={1}>
                  {projects.slice(0, 6).map(p => (
                    <Box
                      key={p._id}
                      onClick={() => navigate(PROJECT_ROUTES.overview(workspace.slug, p.slug))}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: "1px solid",
                        borderColor: "divider",
                        "&:hover": { bgcolor: "action.hover" },
                        transition: "0.15s",
                      }}
                    >
                      <Avatar
                        src={p.avatar}
                        sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}
                      >
                        {(p.name || "P")[0]}
                      </Avatar>
                      <Box flex={1} minWidth={0}>
                        <Typography variant="body2" fontWeight={600} noWrap>{p.name}</Typography>
                        {p.description && (
                          <Typography variant="caption" color="text.secondary" noWrap>{p.description}</Typography>
                        )}
                      </Box>
                      <ArrowForwardIos sx={{ fontSize: 12, color: "text.disabled" }} />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Health Insights */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography fontWeight={600} mb={2}>Workspace Health Insights</Typography>

              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <Stack spacing={3}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">Overall Health Score</Typography>
                      <Typography variant="body2" fontWeight={700}>{metrics?.overallHealthScore}/100</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={metrics?.overallHealthScore || 0}
                      color={metrics?.healthStatus === "HEALTHY" ? "success" : metrics?.healthStatus === "WARNING" ? "warning" : "error"}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1.5}>Risk Flags</Typography>
                    {metrics?.riskFlags?.length === 0 ? (
                      <Chip label="No active risks" size="small" color="success" variant="outlined" />
                    ) : (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {metrics?.riskFlags?.map(flag => (
                          <Chip
                            key={flag}
                            label={flag.replace(/_/g, " ")}
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ textTransform: "capitalize" }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block">Active Projects</Typography>
                      <Typography variant="h6" fontWeight={700}>{metrics?.totalProjects ?? 0}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block">Total Members</Typography>
                      <Typography variant="h6" fontWeight={700}>{metrics?.totalMembers ?? 0}</Typography>
                    </Grid>
                  </Grid>

                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <WorkspaceInviteDialog
        open={workspaceInviteOpen}
        onClose={() => setWorkspaceInviteOpen(false)}
      />
      <CreateProjectDialog
        onClose={() => setCreateProjectDialogOpen(false)}
        open={createProjectDialogOpen}
      />
    </Box>
  );
}
