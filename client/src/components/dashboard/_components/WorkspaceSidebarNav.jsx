import { useCallback, useEffect, useRef, useState } from 'react'
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
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { callApi } from '../../../api/api';
import { useDispatch, useSelector } from 'react-redux';
import { PROJECT_ROUTES, WORKSPACE_ROUTES } from '../../../lib/routes';
import UserMenu from '../../features/account/UserMenu';
import { addProject, setProjects } from '../../../redux/slices/workspaceSlice';
import CreateProjectDialog from '../../features/projects/_components/CreateProjectDialog';
import { getImageUrl } from '../../../utils/image.utils';
import { resolveWorkspaceRole } from '../../../utils/workspaceRole.utils';
import { isAdmin } from '../../../utils/permissions.utils';
import { useSocketEvent } from '../../../lib/socket';
import { removeProject } from '../../../redux/slices/workspaceSlice';

export default function WorkspaceSidebarNav() {
    const [openCreateProjectDialog, setOpenCreateProjectDialog] = useState(false);
    const workspace = useSelector((state) => state.workspace);
    const authUser = useSelector((state) => state.auth?.data);
    const currentSessionId = authUser?.currentSessionId || authUser?.sessionId || null;
    const { workspaceSlug: routeWorkspaceSlug } = useParams();
    const workspaceSlug = routeWorkspaceSlug || workspace?.slug || workspace?.currentWorkspace?.slug;
    const workspaceRole = resolveWorkspaceRole(workspace, authUser);
    const userIsAdmin = isAdmin(workspaceRole);
    const canOpenAgent = userIsAdmin;
    const canViewWorkspaceMembers = userIsAdmin;

    const loadedWorkspaceSlugRef = useRef(null);
    const workspaceProjectsCountRef = useRef(0);

    const workspaceProjects = Array.isArray(workspace?.projects)
        ? workspace.projects
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
                ...(canViewWorkspaceMembers ? [
                    { id: 'members', label: 'Members', icon: <PeopleIcon />, path: WORKSPACE_ROUTES.workspaceMembers(workspaceSlug) },
                ] : []),
                ...(userIsAdmin ? [
                    { id: 'settings', label: 'Settings', icon: <SettingsIcon />, path: WORKSPACE_ROUTES.workspace(workspaceSlug) + '/settings' },
                ] : []),
            ],
        },
    ]

    const navigate = useNavigate()
    const location = useLocation()

    const [expandedGroups, setExpandedGroups] = useState({
        workspace: true,
        projectsList: true,
    })

    const toggleGroup = (groupId) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupId]: !prev[groupId],
        }))
    }

    useEffect(() => {
        workspaceProjectsCountRef.current = workspaceProjects.length;
    }, [workspaceProjects.length]);

    //  PROJECTS
    const dispatch = useDispatch();
    const fetchProjects = useCallback(async (forceRefresh = false) => {
        if (!workspaceSlug) return
        if (!forceRefresh && loadedWorkspaceSlugRef.current === workspaceSlug && workspaceProjectsCountRef.current > 0) return

        try {
            const res = await callApi({
                method: "get",
                url: `/workspaces/global/${workspaceSlug}`,
            })
            const projects = res?.data?.workspace?.projects || res?.data?.projects || res?.data?.items || res?.data || []
            dispatch(setProjects(projects))
            loadedWorkspaceSlugRef.current = workspaceSlug
        } catch (err) {
            console.error('Failed to fetch projects', err)
        }
    }, [dispatch, workspaceSlug])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void fetchProjects()
        }, 0)
        return () => window.clearTimeout(timer)
    }, [fetchProjects])

    const handleProjectCreated = useCallback((payload) => {
        if (!payload?.project?._id) return;

        if (
            payload.sourceSessionId &&
            String(payload.sourceSessionId) === String(currentSessionId)
        ) {
            return;
        }

        if (
            payload.workspace?.slug &&
            String(payload.workspace.slug) !== String(workspaceSlug)
        ) {
            return;
        }

        dispatch(addProject(payload.project));
    }, [currentSessionId, dispatch, workspaceSlug]);

    useSocketEvent(
        "workspace:project-created",
        handleProjectCreated,
        userIsAdmin && !!workspaceSlug && !!authUser?._id && !!currentSessionId
    );

    const handleProjectMemberAdded = useCallback((payload) => {
        if (!payload?.project?._id) return;

        if (
            payload.sourceSessionId &&
            String(payload.sourceSessionId) === String(currentSessionId)
        ) {
            return;
        }

        if (
            payload.workspace?.slug &&
            String(payload.workspace.slug) !== String(workspaceSlug)
        ) {
            return;
        }

        dispatch(addProject(payload.project));
    }, [currentSessionId, dispatch, workspaceSlug]);

    useSocketEvent(
        "workspace:project-member-added",
        handleProjectMemberAdded,
        !!workspaceSlug && !!authUser?._id && !!currentSessionId
    );

    const handleProjectMemberRemoved = useCallback((payload) => {
        const targetUserId = payload?.targetUserId ? String(payload.targetUserId) : "";
        const currentUserId = authUser?._id ? String(authUser._id) : "";
        const projectId = payload?.project?._id ? String(payload.project._id) : "";
        const projectSlug = payload?.project?.slug || "";

        if (!targetUserId || !currentUserId || targetUserId !== currentUserId) {
            return;
        }

        if (!projectId) return;

        dispatch(removeProject(projectId));

        if (
            projectSlug &&
            location.pathname.includes(`/projects/${projectSlug}`)
        ) {
            navigate(WORKSPACE_ROUTES.workspace(workspaceSlug));
        }
    }, [authUser?._id, dispatch, location.pathname, navigate, workspaceSlug]);

    useSocketEvent(
        "workspace:project-member-removed",
        handleProjectMemberRemoved,
        !!workspaceSlug && !!authUser?._id && !!currentSessionId
    );

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

                            {/* Only admins can create projects */}
                            {userIsAdmin && (
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
                            )}

                            {/* Empty state for members with no projects */}
                            {!userIsAdmin && workspaceProjects.length === 0 && (
                                <Box sx={{ pl: 3, py: 1.5 }}>
                                    <Typography variant="caption" color="text.disabled" display="block">
                                        No projects assigned yet
                                    </Typography>
                                </Box>
                            )}
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
