import React from 'react'
import MarketingHeader from './_components/MarketingHeader'
import { Box } from '@mui/material'
import { Outlet } from "react-router-dom"
export default function MarketingLayout() {
  return (
    <Box>
      <MarketingHeader />
      <Outlet />
    </Box>
  )
}
