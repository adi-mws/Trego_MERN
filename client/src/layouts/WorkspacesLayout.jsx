import React from 'react'
import WorkspacesSidebar from '../components/dashboard/_components/WorkspacesSidebar'
import { Box } from '@mui/material'
import Header from '../components/dashboard/_components/Header'
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
