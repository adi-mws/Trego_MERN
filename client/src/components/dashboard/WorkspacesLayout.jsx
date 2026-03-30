import React from 'react'
import WorkspacesSidebar from './_components/WorkspacesSidebar'
import { Box } from '@mui/material'
import Header from './_components/Header'
import { Outlet } from 'react-router-dom'
import AppThemeProvider from '../../themes/AppThemeProvider'

export default function WorkspacesLayout() {
  return (
    <AppThemeProvider type='dashboard'>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 5fr" }}>

        <WorkspacesSidebar />
        <Box>
          <Header />
          <Box sx={{ overflow: 'hidden' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </AppThemeProvider>
  )
}
