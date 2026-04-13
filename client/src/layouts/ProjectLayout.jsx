import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
export default function ProjectLayout() {
    return (
        <Box>
            <Outlet />
        </Box>
    )
}
