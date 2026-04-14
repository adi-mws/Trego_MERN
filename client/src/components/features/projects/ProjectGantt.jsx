import React from "react";
import { Box, Typography, Stack } from "@mui/material";

const startDate = new Date("2026-04-01");
const totalDays = 20;

const categories = [
  "Backend",
  "Frontend",
  "Testing",
  "DevOps",
  "Design",
  "QA",
];

const tasks = [
  { id: 1, title: "Project Setup", category: "Backend", start: "2026-04-01", end: "2026-04-03", color: "#2e7d32" },
  { id: 2, title: "DB Schema", category: "Backend", start: "2026-04-04", end: "2026-04-07", color: "#c4b91e" },
  { id: 3, title: "Auth API", category: "Backend", start: "2026-04-08", end: "2026-04-14", color: "#38bb2c" },

  { id: 4, title: "UI Wireframes", category: "Design", start: "2026-04-01", end: "2026-04-04", color: "#6a1b9a" },
  { id: 5, title: "Dashboard UI", category: "Frontend", start: "2026-04-05", end: "2026-04-10", color: "#1976d2" },
  { id: 6, title: "Booking UI", category: "Frontend", start: "2026-04-11", end: "2026-04-15", color: "#9e9e9e" },

  { id: 7, title: "Unit Tests", category: "Testing", start: "2026-04-10", end: "2026-04-13", color: "#f57c00" },
  { id: 8, title: "Integration Tests", category: "Testing", start: "2026-04-14", end: "2026-04-18", color: "#f57c00" },

  { id: 9, title: "CI Pipeline", category: "DevOps", start: "2026-04-02", end: "2026-04-06", color: "#2e7d32" },
  { id: 10, title: "Deployment", category: "DevOps", start: "2026-04-17", end: "2026-04-20", color: "#d32f2f" },

  { id: 11, title: "UX Review", category: "QA", start: "2026-04-08", end: "2026-04-10", color: "#6a1b9a" },
];

const getOffset = (date) =>
  (new Date(date) - startDate) / (1000 * 60 * 60 * 24);

const getDuration = (start, end) =>
  (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24) + 1;

export default function ProjectGantt() {
  return (
    <Box
      sx={{
        minHeight: "100vh", 
        width: "100%",
        overflowX: "auto",
        px: 2,
        py: 1,
      }}
    >
      <Box sx={{ minWidth: totalDays * 60 + 160 }}>

        {/* 🔥 HEADER */}
        <Box sx={{ display: "flex", mb: 2 }}>
          <Box sx={{ width: 160 }} />
          {Array.from({ length: totalDays }).map((_, i) => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);

            return (
              <Box
                key={i}
                sx={{
                  width: 60,
                  textAlign: "center",
                  fontSize: 11,
                  color: "text.secondary",
                }}
              >
                {d.getDate()}
              </Box>
            );
          })}
        </Box>

        <Stack spacing={2}>
          {categories.map((cat) => (
            <Box
              key={cat}
              sx={{
                display: "flex",
                alignItems: "center",
                height: 70,
              }}
            >
              {/* Category */}
              <Box sx={{ width: 160 }}>
                <Typography fontSize={"small"} fontWeight={600}>
                  {cat}
                </Typography>
              </Box>

              {/* Timeline */}
              <Box sx={{ position: "relative", flex: 1, height: "100%" }}>

                {/* Grid */}
                {Array.from({ length: totalDays }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      left: i * 60,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      borderBottom: 'solid 1px',
                      opacity: 0.25,
                    }}
                  />
                ))}

                {/* Tasks */}
                {tasks
                  .filter((t) => t.category === cat)
                  .map((task) => {
                    const left = getOffset(task.start) * 60;
                    const width = getDuration(task.start, task.end) * 60;

                    return (
                      <Box
                        key={task.id}
                        sx={{
                          position: "absolute",
                          left,
                          width,
                          height: 32,
                          borderRadius: 1,
                          backgroundColor: task.color,
                          display: "flex",
                          alignItems: "center",
                          px: 1,
                          fontSize: 11,
                          color: "#fff",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                        }}
                      >
                        {task.title}
                      </Box>
                    );
                  })}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}