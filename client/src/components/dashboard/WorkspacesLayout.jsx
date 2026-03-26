import React from 'react'
import WorkspacesSidebar from '../features/shared/WorkspacesSidebar'
import { Box } from '@mui/material'
import Header from '../features/shared/Header'
import { Outlet } from 'react-router-dom'

export default function WorkspacesLayout() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 5fr" }}>
      <WorkspacesSidebar />
      <Box>
        <Header />
        <Box sx={{ overflow: 'hidden' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
