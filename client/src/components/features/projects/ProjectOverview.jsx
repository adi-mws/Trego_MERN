import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import {
  Assignment as TaskIcon,
  CheckCircle as DoneIcon,
  Pending as PendingIcon,
  Timeline as WorkflowIcon,
  Groups,
  AdminPanelSettings,
  PersonOutlined,
  SupportAgentOutlined,
  AccountTreeOutlined,
} from "@mui/icons-material";

import {
  BarChart,
} from "@mui/x-charts/BarChart";
import TasksStatusDoughnutChart from "./_components/TaskStatusDoughnutChart";

export default function ProjectOverview() {
  const hasWorkflow = false; // later from API

  const chartData = [
    { day: "Mon", completed: 3, pending: 5 },
    { day: "Tue", completed: 6, pending: 4 },
    { day: "Wed", completed: 4, pending: 6 },
    { day: "Thu", completed: 8, pending: 2 },
    { day: "Fri", completed: 5, pending: 3 },
  ];

  const taskStatus = {
    completed: 10,
    pending: 11,
    delayed: 2,
  }
  return (
    <Box p={1}>
      {/* Top level stat cards */}

      <Grid container spacing={2} mb={3}>
        {[
          { label: "Members", value: 123, icon: <Groups /> },
          { label: "Roles", value: 23, icon: <AdminPanelSettings /> },
          { label: "Members", value: 56, icon: <PersonOutlined /> },
          { label: "Tasks", value: 12, icon: <SupportAgentOutlined /> },
        ].map((item, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                transition: "0.2s",
                "&:hover": { transform: "translateY(-3px)", boxShadow: 2 },
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                      {item.value || 0}
                    </Typography>
                  </Box>
                  {item.icon}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/*  WORKFLOW / TASK SECTION */}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }} mt={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Workflow & Tasks
              </Typography>

              {!hasWorkflow ? (
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    No workflow found for this project.
                  </Typography>

                  <Button startIcon={<AccountTreeOutlined />} variant="contained">
                    Create Workflow
                  </Button>
                  <Button startIcon={<AccountTreeOutlined />} variant="contained">
                    Create Task Categories
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Typography variant="body2">
                    Active Workflow: Default Workflow
                  </Typography>

                  <Stack direction="row" spacing={2}>
                    <Button variant="contained">
                      Create Task
                    </Button>
                    <Button variant="outlined">
                      View Tasks
                    </Button>
                  </Stack>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TasksStatusDoughnutChart data={taskStatus} />
        </Grid>
      </Grid >
      {/* 🔹 CHART */}
      <Box Box mt={4} >
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Task Activity
            </Typography>

            <BarChart
              xAxis={[{ scaleType: "band", data: chartData.map(d => d.day) }]}
              series={[
                {
                  data: chartData.map(d => d.completed),
                  label: "Completed",
                },
                {
                  data: chartData.map(d => d.pending),
                  label: "Pending",
                },
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </Box>
    </Box >
  );
}