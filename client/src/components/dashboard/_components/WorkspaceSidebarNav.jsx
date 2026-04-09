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
} from '@mui/material'

import {
    People as PeopleIcon,
    Settings as SettingsIcon,
    AccessTime as RolesIcon,
    ExpandMore as ExpandMoreIcon,
    Cabin as AIIcon,
    Folder as ProjectIcon,
} from '@mui/icons-material';

import WorkspaceSwitcher from '../../features/workspaces/_components/WorkspaceSwitcher';
import { useNavigate } from 'react-router-dom';
import { callApi } from '../../../api/api';

const menuGroups = [
    {
        id: 'workspace',
        label: 'WORKSPACE',
        items: [
            { id: 'members', label: 'Members', icon: <PeopleIcon />, path: '/members' },
            { id: 'settings', label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
            { id: 'roles', label: 'Roles', icon: <RolesIcon />, path: '/roles' },
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

export default function WorkspaceSidebarNav() {
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

    //  WORKSPACE STATE 
    const [workspaces, setWorkspaces] = useState([])
    const [workspaceSearch, setWorkspaceSearch] = useState("")
    const [currentWorkspace, setCurrentWorkspace] = useState(null)

    const fetchWorkspaces = async () => {
        try {
            const res = await callApi('/workspaces/names', {
                method: 'GET',
                params: {
                    search: workspaceSearch || undefined,
                }
            })
            setWorkspaces(res?.items || [])
        } catch (err) {
            console.error('Failed to fetch workspaces', err)
        }
    }

    useEffect(() => {
        fetchWorkspaces()
    }, [workspaceSearch])

    const handleWorkspaceChange = (workspace) => {
        setCurrentWorkspace(workspace)
        navigate(`/workspaces/${workspace.slug}`)
    }

    //  PROJECTS 
    const [projects, setProjects] = useState([])

    const fetchProjects = async () => {
        if (!currentWorkspace) return

        try {
            const res = await callApi(`/workspaces/${currentWorkspace.slug}/projects`)
            setProjects(res?.items || [])
        } catch (err) {
            console.error('Failed to fetch projects', err)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [currentWorkspace])

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 1 }}>
            <Box component={'img'} src="/images/logo-with-text.png" alt="Logo" sx={{ width: 100, m: 2 }} />

            {/* Workspace Switcher */}
            <Box sx={{ flexShrink: 0 }}>
                <WorkspaceSwitcher
                    workspaces={workspaces}
                    search={workspaceSearch}
                    onSearchChange={setWorkspaceSearch}
                    currentWorkspace={currentWorkspace}
                    onWorkspaceChange={handleWorkspaceChange}
                />
            </Box>

            <Divider sx={{ my: 1 }} />

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
                        {projects.map((project) => (
                            <ListItemButton
                                key={project._id}
                                onClick={() => navigate(`/projects/${project._id}`)}
                                sx={{ pl: 3 }}
                            >
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                    <ProjectIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={project.name} />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/*  OTHER GROUPS  */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
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
                                                minWidth: 26,
                                                color: 'text.secondary',
                                                '& .MuiSvgIcon-root': {
                                                    fontSize: 16,
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
    )
}