import { Box } from '@mui/material'
import ProjectHeader from '../components/features/projects/_components/ProjectHeader'
import { Outlet } from 'react-router-dom'
export default function ProjectLayout() {
    return (
        <Box>
            <ProjectHeader />
            <Outlet />
        </Box>
    )
}
