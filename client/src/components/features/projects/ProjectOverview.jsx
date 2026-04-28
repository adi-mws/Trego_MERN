import { useEffect, useState, useCallback } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Stack,
  CircularProgress, LinearProgress, Chip, 
  IconButton, Tooltip,
  useTheme,
} from "@mui/material";
import {
  Assignment as TaskIcon,
  CheckCircleOutline,
  ErrorOutline,
  AccessTimeOutlined,
  CategoryOutlined,
  AccountTreeOutlined,
  GroupOutlined,
  RefreshOutlined,
} from "@mui/icons-material";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { useSelector } from "react-redux";
import { callApi } from "../../../api/api";
import { useNavigate, useParams } from "react-router-dom";
import { PROJECT_ROUTES } from "../../../lib/routes";
import { isClient, isClientProjectRole } from "../../../utils/permissions.utils";
import { resolveWorkspaceRole } from "../../../utils/workspaceRole.utils";

function StatCard({ label, value, icon, color, subtitle }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: "100%", transition: "0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{label}</Typography>
            <Typography variant="h4" fontWeight={700} color={color || "text.primary"}>{value ?? "—"}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color || "#666"}18`, color: color || "text.secondary" }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

const PRIORITY_COLOR = { HIGH: "#f5222d", MEDIUM: "#faad14", LOW: "#52c41a" };

export default function ProjectOverview() {
  const { _id: projectId } = useSelector(s => s.project);
  const project = useSelector((state) => state.project);
  const { workspaceSlug, projectSlug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const workspace = useSelector((state) => state.workspace);
  const authUser = useSelector((state) => state.auth?.data);
  const workspaceRole = resolveWorkspaceRole(workspace, authUser);
  const clientProjectViewer = isClient(workspaceRole) || isClientProjectRole(project);

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    if (!projectId) return;
    await Promise.resolve();
    setLoading(true);
    const res = await callApi({ method: "get", url: `/projects/${projectId}/metrics` });
    if (res.success) setMetrics(res.data.data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchMetrics();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchMetrics]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const tasks = metrics?.tasks || { total: 0, completed: 0, overdue: 0, inProgress: 0 };
  const completePct = tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0;

  const pieData = (metrics?.byCategory || []).filter(c => c.count > 0).map(c => ({
    label: c.name,
    value: c.count,
    color: c.color,
  }));

  const priorityData = ["HIGH", "MEDIUM", "LOW"].map(p => ({
    label: p,
    value: metrics?.byPriority?.[p] || 0,
    color: PRIORITY_COLOR[p],
  }));
  const projectTitle = project?.name ? `${project.name} - Overview` : "Project - Overview";

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, height: "100%", overflowY: "auto", minWidth: 0 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={3} gap={1.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={500}>{projectTitle}</Typography>
          <Typography variant="body2" color="text.secondary">Real-time metrics and progress</Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchMetrics} size="small"><RefreshOutlined /></IconButton>
        </Tooltip>
      </Stack>

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total Tasks" value={tasks.total} icon={<TaskIcon />} color={theme.palette.primary.main} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Completed" value={tasks.completed} icon={<CheckCircleOutline />} color={theme.palette.success.main} subtitle={`${completePct}% done`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Overdue" value={tasks.overdue} icon={<ErrorOutline />} color={theme.palette.error.main} subtitle="Past deadline" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="In Progress" value={tasks.inProgress} icon={<AccessTimeOutlined />} color={theme.palette.warning.main} />
        </Grid>
      </Grid>

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography fontWeight={600}>Overall Completion</Typography>
            <Chip label={`${completePct}%`} size="small" color={completePct === 100 ? "success" : "primary"} />
          </Stack>
          <LinearProgress
            variant="determinate"
            value={completePct}
            sx={{ height: 10, borderRadius: 5, bgcolor: "action.hover" }}
            color={completePct === 100 ? "success" : "primary"}
          />
          <Stack direction="row" spacing={3} mt={1.5} flexWrap="wrap" useFlexGap>
            {[
              { label: "Completed", val: tasks.completed, color: "#52c41a" },
              { label: "In Progress", val: tasks.inProgress, color: theme.palette.primary.main },
              { label: "Overdue", val: tasks.overdue, color: "#f5222d" },
            ].map(item => (
              <Stack key={item.label} direction="row" spacing={0.75} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
                <Typography variant="caption" color="text.secondary">{item.label}: <b>{item.val}</b></Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography fontWeight={600} mb={2}>Tasks by Category</Typography>
              {pieData.length > 0 ? (
                <PieChart
                  series={[{
                    data: pieData,
                    innerRadius: 50,
                    outerRadius: 90,
                    paddingAngle: 3,
                    cornerRadius: 4,
                    highlightScope: { faded: "global", highlighted: "item" },
                  }]}
                  height={200}
                  slotProps={{
                    legend: {
                      direction: "column",
                      position: { vertical: "middle", horizontal: "right" },
                      sx: {
                        // container box
                        backgroundColor: "rgba(255,255,255,0.8)",
                        backdropFilter: "blur(6px)",
                        borderRadius: "12px",
                        padding: "6px 10px",
                        border: "1px solid #e0e0e0",

                        gap: 4,

                        "& .MuiChartsLegend-item": {
                          gap: 6,
                        },

                        "& .MuiChartsLegend-label": {
                          fontSize: "11px",
                          fontWeight: 500,
                          color: "#555",
                        },
                        "& .MuiChartsLegend-mark": {
                          width: 8,
                          height: 8,
                          borderRadius: "2px",
                        },
                      },
                    },
                  }}
                />
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                  <Typography color="text.secondary" variant="body2">No tasks yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography fontWeight={600} mb={2}>Tasks by Priority</Typography>
              <BarChart
                xAxis={[{ scaleType: "band", data: priorityData.map(d => d.label) }]}
                series={[{
                  data: priorityData.map(d => d.value),
                  // label: "Tasks",
                  color: theme.palette.primary.main,
                }]}
                height={200}
                margin={{ top: 10, right: 10, bottom: 30, left: 30 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!clientProjectViewer && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              variant="outlined"
              sx={{ borderRadius: 3, cursor: "pointer", "&:hover": { boxShadow: 2 } }}
              onClick={() => navigate(PROJECT_ROUTES.projectMembers(workspaceSlug, projectSlug))}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#722ed118", color: "#722ed1" }}>
                    <GroupOutlined />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>{metrics?.members ?? 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Members</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              variant="outlined"
              sx={{ borderRadius: 3, cursor: "pointer", "&:hover": { boxShadow: 2 } }}
              onClick={() => navigate(PROJECT_ROUTES.projectTaskCategories(workspaceSlug, projectSlug))}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#13c2c218", color: "#13c2c2" }}>
                    <CategoryOutlined />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>{metrics?.categories ?? 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Categories</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              variant="outlined"
              sx={{ borderRadius: 3, cursor: "pointer", "&:hover": { boxShadow: 2 } }}
              onClick={() => navigate(PROJECT_ROUTES.projectWorkflows(workspaceSlug, projectSlug))}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#fa541c18", color: "#fa541c" }}>
                    <AccountTreeOutlined />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>{metrics?.workflows ?? 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Workflows</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
