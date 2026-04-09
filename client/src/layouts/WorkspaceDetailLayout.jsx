import React from 'react'
import WorkspaceSidebarNav from '../components/dashboard/_components/WorkspaceSidebarNav'
import { Box } from '@mui/material'
import Header from '../components/dashboard/_components/Header'
import { Outlet } from 'react-router-dom'
import MembersSidebar from '../components/dashboard/_components/MembersSidebar'

export default function WorkspacesLayout() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 5fr" }}>

      <WorkspaceSidebarNav />
      <Box>
        <Header />
        <Box sx={{ overflow: 'hidden' }}>
          <Outlet />
        </Box>
        <MembersSidebar />
      </Box>
    </Box>
  )
}
