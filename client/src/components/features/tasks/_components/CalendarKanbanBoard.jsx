import React, { useState } from 'react'
import { Box, Typography, IconButton, Paper } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const hours = Array.from({ length: 12 }, (_, i) => i + 8)

const initialTasks = [
  {
    id: '1',
    title: 'UI Design',
    day: 0,
    start: 10,
    end: 12,
  },
]

export default function CalendarKanban() {
  const [tasks] = useState(initialTasks)
  const [weekOffset, setWeekOffset] = useState(0)

  const hourHeight = 60

  return (
    <Box sx={{ p: 2 }}>

      {/*  DATE HEADER (IMPORTANT) */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => setWeekOffset((p) => p - 1)}>
          <ChevronLeft />
        </IconButton>

        <Typography fontWeight={600}>
          Aug 12 - Aug 18
        </Typography>

        <IconButton onClick={() => setWeekOffset((p) => p + 1)}>
          <ChevronRight />
        </IconButton>
      </Box>

      {/* GRID */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '80px repeat(5, 1fr)',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          position: 'relative',
        }}
      >
        {/* Header Row */}
        <Box />
        {days.map((day) => (
          <Box
            key={day}
            sx={{
              p: 1,
              borderLeft: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 600,
              bgcolor: 'background.default',
            }}
          >
            {day}
          </Box>
        ))}

        {/* Time + Grid */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>

            {/* Time */}
            <Box
              sx={{
                height: hourHeight,
                borderTop: '1px solid',
                borderColor: 'divider',
                fontSize: 11,
                px: 1,
                color: 'text.secondary',
              }}
            >
              {hour}:00
            </Box>

            {/* Cells */}
            {days.map((_, i) => (
              <Box
                key={i}
                sx={{
                  height: hourHeight,
                  borderTop: '1px solid',
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  bgcolor: 'background.default',
                }}
              />
            ))}
          </React.Fragment>
        ))}

        {/* ✅ TASKS INSIDE GRID */}
        {tasks.map((task) => {
          const top = (task.start - 8) * hourHeight
          const height = (task.end - task.start) * hourHeight

          return (
            <Paper
              key={task.id}
              sx={{
                position: 'absolute',
                top,
                left: `calc(80px + ${task.day} * ((100% - 80px) / 5))`,
                width: `calc((100% - 80px) / 5 - 4px)`,
                height,
                bgcolor: 'primary.main',
                color: 'white',
                p: 1,
                fontSize: 12,
                borderRadius: 1,
              }}
            >
              {task.title}
            </Paper>
          )
        })}
      </Box>
    </Box>
  )
}