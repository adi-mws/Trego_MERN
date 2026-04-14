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
} from "@mui/icons-material";

import {
  BarChart,
} from "@mui/x-charts/BarChart";
import TasksStatusDoughnutChart from "./_components/TaskStatusDoughnutChart";

export default function ProjectOverview() {
  const hasWorkflow = false; // later from API

  const stats = [
    { label: "Total Tasks", value: 42, icon: <TaskIcon /> },
    { label: "Completed", value: 18, icon: <DoneIcon /> },
    { label: "Pending", value: 24, icon: <PendingIcon /> },
  ];

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
    <Box p={3}>
       {/* 🔹 WORKFLOW / TASK SECTION */}
      <Box mt={4}>
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

                <Button variant="contained">
                  Create Workflow
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
      </Box>
      <TasksStatusDoughnutChart data={taskStatus} />

      {/* 🔹 CHART */}
      <Box mt={4}>
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
    </Box>
  );
}