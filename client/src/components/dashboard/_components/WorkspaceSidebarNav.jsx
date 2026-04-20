import { use, useEffect, useState } from 'react'
import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Collapse,
    Avatar,
} from '@mui/material'
import {
    People as PeopleIcon,
    Settings as SettingsIcon,
    AccessTime as RolesIcon,
    ExpandMore as ExpandMoreIcon,
    Cabin as AIIcon,
    FolderOutlined as ProjectIcon,
    Add,
    AutoGraphOutlined,
} from '@mui/icons-material';
import WorkspaceSwitcher from '../../features/workspaces/_components/WorkspaceSwitcher';
import { useNavigate } from 'react-router-dom';
import { callApi } from '../../../api/api';
import { useDispatch, useSelector } from 'react-redux';
import { PROJECT_ROUTES, WORKSPACE_ROUTES } from '../../../lib/routes';
import UserMenu from '../../features/account/UserMenu';
import { setProjects } from '../../../redux/slices/workspaceSlice';
import CreateProjectDialog from '../../features/projects/_components/CreateProjectDialog';
import { getImageUrl } from '../../../utils/image.utils';
export default function WorkspaceSidebarNav() {
    const [openCreateProjectDialog, setOpenCreateProjectDialog] = useState(false);
    const workspace = useSelector((state) => state.workspace);
    const menuGroups = [
        {
            id: 'workspace',
            label: 'WORKSPACE',
            items: [
                { id: 'overview', label: 'Overview', icon: <AutoGraphOutlined />, path: WORKSPACE_ROUTES.workspace(workspace?.slug) },
                { id: 'members', label: 'Members', icon: <PeopleIcon />, path: WORKSPACE_ROUTES.workspaceMembers(workspace?.slug) },
            ],
        },
        {
            id: 'ai-agent',
            label: 'AI AGENT',
            items: [
                { id: 'ai-settings', label: 'AI Settings', icon: <AIIcon />, path: '/ai/settings' },
                { id: 'integrations', label: 'Integrations', icon: <SettingsIcon />, path: '/ai/integrations' },
            ],
        },
    ]
    const navigate = useNavigate()

    const [expandedGroups, setExpandedGroups] = useState({
        workspace: false,
        'ai-agent': false,
        projectsList: true,
    })
    const toggleGroup = (groupId) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupId]: !prev[groupId],
        }))
    }

    //  PROJECTS 
    const dispatch = useDispatch();
    const fetchProjects = async () => {
        if (!workspace) return

        try {
            const res = await callApi(`/workspaces/${workspace.slug}/projects`)
            dispatch((res?.items || []))
        } catch (err) {
            console.error('Failed to fetch projects', err)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [workspace])

    const { _id: projectId } = useSelector((state) => state.project)



    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 1 }}>
            <Box component={'img'} src="/images/logo-with-text.png" alt="Logo" sx={{ width: 80, m: 1 }} />

            {/* Workspace Switcher */}
            <Box sx={{ flexShrink: 0, mt: 1 }}>
                <WorkspaceSwitcher />
            </Box>

            <Divider sx={{ my: 1 }} />
            <Box sx={{ overflowY: 'auto' }}>
                {/*  PROJECT LIST  */}
                <Box>
                    <ListItemButton onClick={() => toggleGroup('projectsList')}>
                        <Typography
                            variant="caption"
                            sx={{
                                flex: 1,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                fontSize: '0.7rem',
                                color: 'text.secondary',
                            }}
                        >
                            PROJECTS
                        </Typography>

                        <ExpandMoreIcon
                            sx={{
                                transform: expandedGroups.projectsList ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: '0.3s',
                            }}
                        />
                    </ListItemButton>

                    <Collapse in={expandedGroups.projectsList}>
                        <List disablePadding>
                            {workspace.projects?.map((project) => (
                                <ListItemButton
                                    key={project._id}
                                    selected={project._id === projectId}
                                    onClick={() =>
                                        navigate(PROJECT_ROUTES.overview(workspace.slug, project.slug))
                                    }
                                    sx={{ pl: 3 }}
                                >
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                        <Avatar
                                            sx={{ width: 20, height: 20 }}
                                            src={getImageUrl(project.avatar)}
                                        />
                                    </ListItemIcon>

                                    <ListItemText
                                        primaryTypographyProps={{
                                            fontSize: 13,
                                            fontWeight: 500,
                                        }}
                                        primary={project.name}
                                    />
                                </ListItemButton>
                            ))}

                            <ListItemButton
                                onClick={() => setOpenCreateProjectDialog(true)}
                                sx={{
                                    pl: 3,
                                    mt: 0.5,
                                    borderRadius: 1,
                                    color: "primary.main",
                                    "&:hover": {
                                        backgroundColor: "action.hover",
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 28, color: "primary.main" }}>
                                    <Add fontSize="small" />
                                </ListItemIcon>

                                <ListItemText
                                    primary="New Project"
                                    primaryTypographyProps={{
                                        fontSize: 13,
                                        fontWeight: 500,
                                    }}
                                />
                            </ListItemButton>
                        </List>
                    </Collapse>
                </Box>

                <Divider sx={{ my: 1 }} />

                {/*  OTHER GROUPS  */}
                <Box sx={{ flex: 1 }}>
                    {menuGroups.map((group) => (
                        <Box key={group.id}>
                            <ListItemButton onClick={() => toggleGroup(group.id)}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        flex: 1,
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        fontSize: 11,
                                        color: 'text.secondary',
                                    }}
                                >
                                    {group.label}
                                </Typography>

                                <ExpandMoreIcon
                                    sx={{
                                        transform: expandedGroups[group.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: '0.3s',
                                    }}
                                />
                            </ListItemButton>

                            <Collapse in={expandedGroups[group.id]}>
                                <List disablePadding>
                                    {group.items.map((item) => (
                                        <ListItemButton
                                            key={item.id}
                                            onClick={() => navigate(item.path)}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 28,
                                                    color: 'text.secondary',
                                                    '& .MuiSvgIcon-root': {
                                                        fontSize: 20,
                                                    },
                                                }}
                                            >
                                                {item.icon}
                                            </ListItemIcon>

                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontSize: 13,
                                                }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>
                    ))}
                </Box>
            </Box>
            <UserMenu />
            <CreateProjectDialog open={openCreateProjectDialog} onClose={() => setOpenCreateProjectDialog(false)} />

        </Box>
    )
}