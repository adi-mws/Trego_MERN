import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'

export default function ProjectLayout() {
  return (
    <Box
      sx={{
        height: "100%",          
        display: "flex",         
        flexDirection: "column",
        minHeight: 0,            
      }}
    >
      <Outlet />
    </Box>
  )
}