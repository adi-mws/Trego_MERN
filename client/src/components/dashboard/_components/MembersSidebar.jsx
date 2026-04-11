import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useMemo, useState } from 'react';
import { useSelector } from "react-redux";
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
    ListItemAvatar,
    ListItemText,
    ListItemButton,
    Button,
    Stack,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

import { WorkspaceInviteDialog } from '../../features/workspaces/_components/WorkspaceInviteDialog';
import { ProjectInviteDialog } from '../../features/projects/_components/ProjectInviteDialog';
import { MemberProfilePopover } from '../../features/workspaces/_components/MembersProfilePopover';
import { getImageUrl } from '../../../utils/image.utils';

/* grouping */
function groupMembers(members) {
    return members.reduce((acc, m) => {
        const role = m.role?.toLowerCase() || "member";
        acc[role] ??= [];
        acc[role].push(m);
        return acc;
    }, {});
}

export default function MembersSidebar() {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState('workspace');
    const [search, setSearch] = useState('');
    const [workspaceInviteOpen, setWorkspaceInviteOpen] = useState(false);
    const [projectInviteOpen, setProjectInviteOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);

    // ✅ REDUX DATA
    const workspaceMembers = useSelector((state) => state.workspace.members);

    const handleMemberClick = (event, member) => {
        setAnchorEl(event.currentTarget);
        setSelectedMember(member);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedMember(null);
    };

    // ✅ filter members
    const filteredMembers = useMemo(() => {
        if (tab !== "workspace") return [];

        return (workspaceMembers || []).filter((m) =>
            m.name?.toLowerCase().includes(search.toLowerCase())
        );
    }, [workspaceMembers, search, tab]);

    // ✅ group by role
    const groupedMembers = useMemo(
        () => groupMembers(filteredMembers),
        [filteredMembers]
    );

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
            {/* Toggle */}
            <Box
                onClick={() => setOpen((v) => !v)}
                sx={{
                    width: 20,
                    cursor: 'pointer',
                    bgcolor: "action.hover",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        transform: 'rotate(-90deg)',
                        fontWeight: 600,
                    }}
                >
                    Members
                </Typography>
            </Box>

            {/* Panel */}
            <Box
                sx={{
                    width: open ? 340 : 0,
                    transition: 'width 240ms ease',
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    borderLeft: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Stack height="100%">
                    {/* Header */}
                    <Box sx={{ p: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: "space-between" }}>
                            <Tabs
                                value={tab}
                                onChange={(_, v) => {
                                    setTab(v);
                                    setSearch('');
                                }}
                            >
                                <Tab value="workspace" label="Workspace" />
                                <Tab value="project" label="Project" />
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
                        />
                    </Box>

                    <Divider />

                    {/* CONTENT */}
                    <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>

                        {/* WORKSPACE TAB */}
                        {tab === "workspace" && (
                            Object.entries(groupedMembers).map(([role, list]) => (
                                <Box key={role} sx={{ mb: 1.5 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                                    >
                                        {role}
                                    </Typography>

                                    <List dense>
                                        {list.map((m) => (
                                            <ListItemButton
                                                key={m._id}
                                                onClick={(e) => handleMemberClick(e, m)}
                                                sx={{
                                                    py: 0.75, // ↓ slightly reduced
                                                    px: 1,
                                                    borderRadius: 1.5,
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar
                                                        sx={{
                                                            width: 32,  // ↓ from 40
                                                            height: 32,
                                                            fontSize: 13,
                                                        }}
                                                        src={getImageUrl(m.avatar)}
                                                    >
                                                        {m.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                    </Avatar>
                                                </ListItemAvatar>

                                                <ListItemText
                                                    primary={
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ fontWeight: 500, fontSize: 14 }}
                                                        >
                                                            {m.name}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Box>
                            ))
                        )}

                        {/* PROJECT TAB */}
                        {tab === "project" && (
                            <Box sx={{ p: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    No project selected
                                </Typography>
                            </Box>
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
                                onClick={() => setProjectInviteOpen(true)}
                            >
                                Invite to Project
                            </Button>
                        )}
                    </Box>

                    {/* Dialogs */}
                    <WorkspaceInviteDialog
                        open={workspaceInviteOpen}
                        onClose={() => setWorkspaceInviteOpen(false)}
                    />

                    <ProjectInviteDialog
                        open={projectInviteOpen}
                        onClose={() => setProjectInviteOpen(false)}
                        workspaceMembers={(workspaceMembers || []).map((m) => ({
                            id: m._id,
                            name: m.name,
                        }))}
                    />
                </Stack>

                <MemberProfilePopover
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    memberId={selectedMember?._id}
                />
            </Box>
        </Box>
    );
}