import { useEffect, useState } from 'react'
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
    ExpandMore as ExpandMoreIcon,
    Cabin as AIIcon,
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
import { resolveWorkspaceRole } from '../../../utils/workspaceRole.utils';
export default function WorkspaceSidebarNav() {
    const [openCreateProjectDialog, setOpenCreateProjectDialog] = useState(false);
    const workspace = useSelector((state) => state.workspace);
    const authUser = useSelector((state) => state.auth?.data);
    const workspaceSlug = workspace?.slug || workspace?.currentWorkspace?.slug;
    const workspaceRole = resolveWorkspaceRole(workspace, authUser);
    const canOpenAgent = ["ADMIN", "OWNER"].includes(workspaceRole);
    const workspaceProjects = Array.isArray(workspace?.projects)
        ? workspace.projects
        : Array.isArray(workspace?.projects?.items)
            ? workspace.projects.items
            : Array.isArray(workspace?.projects?.projects)
                ? workspace.projects.projects
                : Array.isArray(workspace?.currentWorkspace?.projects)
                    ? workspace.currentWorkspace.projects
                    : Array.isArray(workspace?.currentWorkspace?.projects?.items)
                        ? workspace.currentWorkspace.projects.items
                        : Array.isArray(workspace?.currentWorkspace?.projects?.projects)
                            ? workspace.currentWorkspace.projects.projects
                            : [];
    const menuGroups = [
        {
            id: 'workspace',
            label: 'WORKSPACE',
            items: [
                { id: 'overview', label: 'Overview', icon: <AutoGraphOutlined />, path: WORKSPACE_ROUTES.workspace(workspaceSlug) },
                ...(canOpenAgent && workspaceSlug ? [
                    { id: 'agent', label: 'Trego Agent', icon: <AIIcon />, path: `/app/${workspaceSlug}/agent` },
                ] : []),
                { id: 'members', label: 'Members', icon: <PeopleIcon />, path: WORKSPACE_ROUTES.workspaceMembers(workspaceSlug) },
                { id: 'settings', label: 'Settings', icon: <SettingsIcon />, path: WORKSPACE_ROUTES.workspace(workspaceSlug) + '/settings' },
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
        workspace: true,
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
        if (!workspaceSlug || workspaceProjects.length > 0) return

        try {
            const res = await callApi({
                method: "get",
                url: `/workspaces/global/${workspaceSlug}`,
            })
            const projects = res?.data?.workspace?.projects || res?.data?.projects || res?.data?.items || res?.data || []
            dispatch(setProjects(projects))
        } catch (err) {
            console.error('Failed to fetch projects', err)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [workspaceSlug, workspaceProjects.length])

    const { _id: projectId } = useSelector((state) => state.project)



    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, p: 1, overflow: 'hidden' }}>
            <Box component={'img'} src="/images/logo-with-text.png" alt="Logo" sx={{ width: 80, m: 1 }} />

            {/* Workspace Switcher */}
            <Box sx={{ flexShrink: 0, mt: 1 }}>
                <WorkspaceSwitcher />
            </Box>

            <Divider sx={{ my: 1 }} />
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
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
                            {workspaceProjects.map((project) => (
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
                                            disabled={!item.path}
                                            onClick={() => item.path && navigate(item.path)}
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
