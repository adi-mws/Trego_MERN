import MarketingHeader from '../components/marketing/_components/MarketingHeader'
import { Box } from '@mui/material'
import { Outlet } from "react-router-dom"
import AppThemeProvider from '../themes/AppThemeProvider'
export default function MarketingLayout() {
  return (
    <AppThemeProvider type="marketing">

      <Box>
        <MarketingHeader />
        <Outlet />
      </Box>
    </AppThemeProvider>
  )
}
