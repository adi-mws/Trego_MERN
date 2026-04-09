import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useMemo, useState } from 'react'
import { MemberProfilePopover } from '../../features/workspaces/_components/MembersProfilePopover';
import {
    Box,
    Avatar,
    Typography,
    Divider,
    IconButton,
    Tabs,
    Tab,
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Collapse,
    ListItemButton,
    Button,
    Stack,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { WorkspaceInviteDialog } from '../../features/workspaces/_components/WorkspaceInviteDialog';
import { ProjectInviteDialog } from '../../features/projects/_components/ProjectInviteDialog';

const users = {
    u1: { id: 'u1', name: 'Alice Johnson', online: true },
    u2: { id: 'u2', name: 'Bob Smith', online: true },
    u3: { id: 'u3', name: 'Carla Gomez', online: false },
    u4: { id: 'u4', name: 'Daniel Wu', online: true },
    u5: { id: 'u5', name: 'Eva Martinez', online: true },
    u6: { id: 'u6', name: 'Frank Chen', online: false },
    u7: { id: 'u7', name: 'Grace Lee', online: true },
    u8: { id: 'u8', name: 'Hassan Ali', online: true },
    u9: { id: 'u9', name: 'Isha Patel', online: false },
    u10: { id: 'u10', name: 'John Miller', online: true },
    u11: { id: 'u11', name: 'Kavya Nair', online: true },
    u12: { id: 'u12', name: 'Liam O’Connor', online: false },
    u13: { id: 'u13', name: 'Meera Singh', online: true },
    u14: { id: 'u14', name: 'Noah Brown', online: true },
    u15: { id: 'u15', name: 'Olivia Wilson', online: false },
    u16: { id: 'u16', name: 'Pranav Sharma', online: true },
    u17: { id: 'u17', name: 'Qi Zhang', online: true },
    u18: { id: 'u18', name: 'Riya Verma', online: false },
    u19: { id: 'u19', name: 'Sofia Alvarez', online: true },
    u20: { id: 'u20', name: 'Tom Anderson', online: true },
}


const workspaceMemberships = [
    { userId: 'u1', role: 'owner' },
    { userId: 'u2', role: 'admin' },
    { userId: 'u3', role: 'member' },
    { userId: 'u4', role: 'member' },
    { userId: 'u5', role: 'member' },
    { userId: 'u6', role: 'member' },
    { userId: 'u7', role: 'member' },
    { userId: 'u8', role: 'member' },
    { userId: 'u9', role: 'member' },
    { userId: 'u10', role: 'member' },
    { userId: 'u11', role: 'member' },
    { userId: 'u12', role: 'member' },
    { userId: 'u13', role: 'member' },
    { userId: 'u14', role: 'member' },
    { userId: 'u15', role: 'member' },
    { userId: 'u16', role: 'member' },
    { userId: 'u17', role: 'member' },
    { userId: 'u18', role: 'member' },
    { userId: 'u19', role: 'member' },
    { userId: 'u20', role: 'member' },
]

const projectMemberships = [
    { userId: 'u1', roles: ['manager'] },
    { userId: 'u2', roles: ['developer'] },
    { userId: 'u3', roles: ['designer'] },
    { userId: 'u4', roles: ['viewer'] },
    { userId: 'u5', roles: ['developer'] },
    { userId: 'u6', roles: ['viewer'] },
    { userId: 'u7', roles: ['designer'] },
    { userId: 'u8', roles: ['developer'] },
    { userId: 'u9', roles: ['viewer'] },
    { userId: 'u10', roles: ['developer'] },
    { userId: 'u11', roles: ['designer'] },
    { userId: 'u12', roles: ['viewer'] },
    { userId: 'u13', roles: ['developer'] },
    { userId: 'u14', roles: ['designer'] },
    { userId: 'u15', roles: ['viewer'] },
    { userId: 'u16', roles: ['developer'] },
    { userId: 'u17', roles: ['designer'] },
    { userId: 'u18', roles: ['viewer'] },
    { userId: 'u19', roles: ['developer'] },
    { userId: 'u20', roles: ['viewer'] },
]


/*  role priority  */
const PROJECT_ROLE_PRIORITY = {
    viewer: 1,
    designer: 2,
    developer: 3,
    manager: 4,
    owner: 0
}

function resolveHighestProjectRole(roles) {
    return roles.reduce((best, r) =>
        PROJECT_ROLE_PRIORITY[r] > PROJECT_ROLE_PRIORITY[best] ? r : best
    )
}

/*  selectors (replace with useSelector later)  */
function selectWorkspaceMembers(search) {
    return workspaceMemberships
        .map((m) => ({
            ...users[m.userId],
            role: m.role,
        }))
        .filter((u) =>
            u.name.toLowerCase().includes(search.toLowerCase())
        )
}

function selectProjectMembers(search) {
    return projectMemberships
        .map((m) => ({
            ...users[m.userId],
            role: resolveHighestProjectRole(m.roles),
        }))
        .filter((u) =>
            u.name.toLowerCase().includes(search.toLowerCase())
        )
}

/*  grouping logic  */

function groupMembers(members) {
    const online = members.filter((m) => m.online)
    const offline = members.filter((m) => !m.online)

    const byRole = online.reduce((acc, m) => {
        acc[m.role] ??= []
        acc[m.role].push(m)
        return acc
    }, {})

    return { byRole, offline }
}

/*  UI helpers  */

const roleColor = (role) => {
    const map = {
        owner: 'error',
        admin: 'warning',
        member: 'info',
        manager: 'error',
        developer: 'success',
        designer: 'info',
        viewer: 'default',
    }
    return map[role] ?? 'default'
}

/*  component  */

export default function MembersSidebar() {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState('workspace')
    const [search, setSearch] = useState('')
    const [offlineOpen, setOfflineOpen] = useState(false)
    const [workspaceInviteOpen, setWorkspaceInviteOpen] = useState(false)
    const [projectInviteOpen, setProjectInviteOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedMember, setSelectedMember] = useState(null)

    const handleMemberClick = (
        event,
        member
    ) => {
        setAnchorEl(event.currentTarget)
        setSelectedMember(member)
    }

    const handleClose = () => {
        setAnchorEl(null)
        setSelectedMember(null)
    }
    const members = useMemo(
        () =>
            tab === 'workspace'
                ? selectWorkspaceMembers(search)
                : selectProjectMembers(search),
        [tab, search]
    )

    const { byRole, offline } = useMemo(
        () => groupMembers(members),
        [members]
    )

    return (
        <Box
            sx={{
                position: 'fixed',
                right: 0,
                top: 64,
                bottom: 0,
                display: 'flex',
                zIndex: 500,

            }}
        >
            <Box
                onClick={() => setOpen((v) => !v)}
                sx={{
                    width: 20,
                    cursor: 'pointer',
                    bgcolor: "action.hover",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    position: 'relative',

                    // Shape
                    clipPath: 'polygon(0 8%, 100% 0, 100% 100%, 0 92%)',

                    // Elevation
                    boxShadow: open
                        ? '-3px 0 10px rgba(0,0,0,0.14)'
                        : '-2px 0 6px rgba(0,0,0,0.1)',

                    transition: 'all 200ms ease',

                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },

                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: '1px',
                        clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0 85%)',
                        pointerEvents: 'none',
                    },

                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        transform: 'rotate(-90deg)',
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        opacity: 0.8,
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}
                >
                    Members
                </Typography>
            </Box>



            {/* Panel */}
            <Box
                sx={{
                    width: open ? 360 : 0,
                    transition: 'width 240ms ease',
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    borderLeft: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Stack height="100%">
                    {/* Header */}
                    <Box sx={{ p: 1, display: 'flex', gap: 1 }}>

                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", gap: 1 }}>

                                <Tabs
                                    value={tab}
                                    onChange={(_, v) => {
                                        setTab(v)
                                        setSearch('')
                                    }}

                                    slotProps={{
                                        indicator: {
                                            sx: {
                                                height: 2,
                                                backgroundColor: 'primary.main',
                                                borderRadius: 1,
                                            },
                                        },
                                    }}
                                >
                                    <Tab value="workspace" label="Workspace" sx={{ fontSize: 13 }} />
                                    <Tab value="project" label="Project" sx={{ fontSize: 13 }} />

                                </Tabs>
                                <IconButton onClick={() => setOpen(false)}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            <TextField
                                sx={{ mt: 1 }}
                                size="small"
                                fullWidth
                                placeholder="Search members"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                slotProps={{
                                    input: {
                                        sx: {
                                            fontSize: '0.8rem',
                                            '&::placeholder': {
                                                fontSize: '0.75rem',
                                                opacity: 0.7,
                                            },
                                        },
                                    },
                                }}
                            />
                        </Box>

                    </Box>

                    <Divider />

                    {/* Members */}
                    <Box sx={{
                        flex: 1, overflow: 'auto', p: 1,
                        /* Firefox */
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(0,0,0,0.3) transparent',

                        /* Chrome, Edge, Safari */
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            borderRadius: '6px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: 'rgba(0,0,0,0.45)',
                        },
                    }}>
                        {Object.entries(byRole).map(([role, list]) => (
                            <Box key={role} sx={{ mb: 1.25 }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        fontSize: '0.72rem',
                                        color: 'text.secondary',
                                        mb: 0.75,
                                    }}
                                >
                                    {role}
                                </Typography>

                                <List disablePadding dense>
                                    {list.map((m) => (
                                        <ListItemButton
                                            key={m.id}
                                            sx={{
                                                py: 0.5,
                                                px: 0.75,
                                                gap: 0.75,
                                            }}
                                            onClick={(e) => handleMemberClick(e, m)}

                                        >


                                            <ListItemAvatar sx={{ minWidth: 34 }}>
                                                <Avatar
                                                    sx={{
                                                        width: 26,
                                                        height: 26,
                                                        fontSize: '0.75rem',
                                                    }}
                                                >
                                                    {m.name
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .slice(0, 2)
                                                        .join('')}
                                                </Avatar>
                                            </ListItemAvatar>

                                            <ListItemText
                                                primary={m.name}
                                                // secondary="Online"
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    sx: {
                                                        fontSize: '0.85rem',
                                                        fontWeight: 500,
                                                        lineHeight: 1.25,
                                                    },
                                                }}
                                                secondaryTypographyProps={{
                                                    sx: {
                                                        mt: 0.25,
                                                        fontSize: '0.7rem',
                                                        lineHeight: 1,
                                                        color: 'text.secondary',
                                                    },
                                                }}
                                            />
                                            {/* 
                      <Chip
                        label={m.role}
                        size="small"
                        color={roleColor(m.role)}
                        variant="outlined"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          ml: 0.5,
                        }}
                      /> */}
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Box>
                        ))}

                        {/* Offline */}
                        {offline.length > 0 && (
                            <>
                                <Divider sx={{ my: 0.75 }} />

                                <ListItemButton
                                    dense
                                    onClick={() => setOfflineOpen((v) => !v)}
                                    sx={{ py: 0.5 }}

                                >
                                    <ListItemText
                                        primary={`Offline — ${offline.length}`}
                                        primaryTypographyProps={{
                                            variant: 'body2',
                                            sx: {
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                            },
                                        }}
                                    />
                                </ListItemButton>


                                <Collapse in={offlineOpen}>
                                    <List dense>
                                        {offline.map((m) => (
                                            <ListItem key={m.id} sx={{ py: 0.4 }}>
                                                <ListItemAvatar sx={{ minWidth: 30 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 24,
                                                            height: 24,
                                                            fontSize: '0.7rem',
                                                        }}
                                                    >
                                                        {m.name[0]}
                                                    </Avatar>
                                                </ListItemAvatar>

                                                <ListItemText
                                                    primary={m.name}
                                                    primaryTypographyProps={{
                                                        variant: 'body2',
                                                        sx: { fontSize: '0.8rem' },
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            </>
                        )}
                    </Box>

                    <Divider />

                    {/* Footer */}
                    <Box sx={{ p: 2 }}>
                        {tab === 'workspace' ? (
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<PersonAddOutlinedIcon />}
                                onClick={() => setWorkspaceInviteOpen(true)}
                            >
                                Invite to Workspace
                            </Button>
                        ) : (
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<PersonAddOutlinedIcon />}
                                onClick={() => setProjectInviteOpen(true)}              >
                                Invite to Project
                            </Button>
                        )}
                    </Box>

                    <WorkspaceInviteDialog
                        open={workspaceInviteOpen}
                        onClose={() => setWorkspaceInviteOpen(false)}
                    />

                    <ProjectInviteDialog
                        open={projectInviteOpen}
                        onClose={() => setProjectInviteOpen(false)}
                        workspaceMembers={Object.values(users).map((u) => ({
                            id: u.id,
                            name: u.name,
                        }))}
                    />


                </Stack>

                <MemberProfilePopover
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    member={selectedMember}
                />
            </Box>
        </Box>
    )
}
