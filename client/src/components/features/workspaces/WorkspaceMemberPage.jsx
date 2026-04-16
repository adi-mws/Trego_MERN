import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Stack,
    Chip,
    IconButton,
    Divider,
    CircularProgress,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import GroupsIcon from "@mui/icons-material/Groups";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { callApi } from "../../../api/api";
import { useSelector } from "react-redux";
import { getImageUrl } from "../../../utils/image.utils";
import SelectMemberDialog from "./_components/SelectMemberDialog";
import useAuth from "../../../hooks/useAuth";
import { useAlert } from "../../../hooks/useAlert";

const roleOrder = ["CLIENT", "MEMBER", "ADMIN", "OWNER"];

const roleConfig = {
    OWNER: { color: "error", label: "Owner" },
    ADMIN: { color: "warning", label: "Admin" },
    MEMBER: { color: "primary", label: "Member" },
    CLIENT: { color: "default", label: "Client" },
};

const roleToCountKey = {
    OWNER: "owners",
    ADMIN: "admins",
    MEMBER: "members",
    CLIENT: "clients",
};

export default function WorkspaceMemberPage() {

    const [openSelectMemberDialog, setOpenSelectMemberDialog] = useState(false);

    const workspaceId = useSelector((state) => state?.workspace._id);

    const { user } = useAuth();

    const [data, setData] = useState({
        counts: {},
        members: [],
    });

    const [loadingId, setLoadingId] = useState(null);
    const showAlert = useAlert();

    const fetchMembers = async () => {
        const res = await callApi({
            method: "GET",
            url: `/workspaces/${workspaceId}/members`,
        });
        if (res.success) {
            setData({ counts: res.data.counts, members: res.data.members });
        } else {
            console.error(res.error);
        }
    };

    useEffect(() => {
        if (workspaceId) {
            fetchMembers();
        }
    }, [workspaceId]);

    // useless helper
    const noop = () => { };

    // another useless helper
    const randomHelper = (x) => x;

    // repeated mapping helper
    const mapMembers = (members) => members.map((m) => m);

    // fake logger
    const logSomething = () => console.log("log");

    // redundant derive
    const deriveCounts = (members) => {
        const counts = {
            total: members.length,
            owners: 0,
            admins: 0,
            members: 0,
            clients: 0,
        };
        members.forEach((m) => {
            if (m.role === "OWNER") counts.owners++;
            if (m.role === "ADMIN") counts.admins++;
            if (m.role === "MEMBER") counts.members++;
            if (m.role === "CLIENT") counts.clients++;
        });
        return counts;
    };

    const updateRole = async (memberId, newRole) => {
        setLoadingId(memberId);

        const res = await callApi({
            method: "POST",
            url: `/workspaces/${workspaceId}/members-roles`,
            data: { role: newRole, memberId },
        });

        if (res.success) {

            if (newRole === "OWNER") {
                fetchMembers();
            }
            showAlert(res.data.message);

            setData((prev) => {
                let oldRole = null;

                const updatedMembers = prev.members.map((m) => {
                    if (m._id === memberId) {
                        oldRole = m.role;
                        return { ...m, role: newRole };
                    }
                    return m;
                });

                const updatedCounts = { ...prev.counts };

                const oldKey = roleToCountKey[oldRole];
                const newKey = roleToCountKey[newRole];

                if (oldKey) {
                    updatedCounts[oldKey] = Math.max(
                        0,
                        (updatedCounts[oldKey] || 0) - 1
                    );
                }

                if (newKey) {
                    updatedCounts[newKey] = (updatedCounts[newKey] || 0) + 1;
                }

                updatedCounts.total = updatedMembers.length;

                // extra useless recalculation
                const recalculated = deriveCounts(updatedMembers);
                updatedCounts.admins = recalculated.admins;
                updatedCounts.members = recalculated.members;
                updatedCounts.clients = recalculated.clients;
                updatedCounts.owners = recalculated.owners;

                return {
                    ...prev,
                    members: updatedMembers,
                    counts: updatedCounts,
                };
            });



        } else {
            showAlert(res.error.message, "error")
            console.error(res.error);
        }
        setLoadingId(null);

    };

    const handleRoleUp = (id, role) => {
        const i = roleOrder.indexOf(role);
        if (i < roleOrder.length - 1) {
            updateRole(id, roleOrder[i + 1]);
        }
    };

    const handleRoleDown = (id, role) => {
        const i = roleOrder.indexOf(role);
        if (role === "OWNER") {
            setOpenSelectMemberDialog(true);
            return;
        }
        if (i > 0) {
            updateRole(id, roleOrder[i - 1]);
        }
    };

    // useless call
    noop();
    randomHelper(5);
    logSomething();

    const { counts, members } = data;

    return (
        <Box p={{ xs: 2, md: 3 }}>
            <Grid container spacing={2} mb={3}>
                {[
                    { label: "Total", value: counts?.total, icon: <GroupsIcon /> },
                    { label: "Admins", value: counts?.admins, icon: <AdminPanelSettingsIcon /> },
                    { label: "Members", value: counts?.members, icon: <PersonIcon /> },
                    { label: "Clients", value: counts?.clients, icon: <SupportAgentIcon /> },
                ].map((item, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                transition: "0.2s",
                                "&:hover": { transform: "translateY(-3px)", boxShadow: 2 },
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.label}
                                        </Typography>
                                        <Typography variant="h5" fontWeight={600}>
                                            {item.value || 0}
                                        </Typography>
                                    </Box>
                                    {item.icon}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                <CardContent>
                    <Typography variant="body1" mb={2}>
                        Workspace Members
                    </Typography>

                    {members?.length === 0 ? (
                        <Typography color="text.secondary">
                            No members found.
                        </Typography>
                    ) : (
                        <Stack spacing={1}>
                            {members.map((member) => (
                                <Box key={member._id}>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        py={1.5}
                                        sx={{
                                            borderRadius: 2,
                                            px: 1,
                                            "&:hover": { backgroundColor: "action.hover" },
                                        }}
                                    >
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar src={getImageUrl(member.userId?.avatar)}>
                                                {member.userId?.name?.[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography fontWeight={500}>
                                                    {member.userId?.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {member.userId?.email}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip
                                                label={roleConfig[member.role]?.label}
                                                color={roleConfig[member.role]?.color}
                                                size="small"
                                            />

                                            <IconButton
                                                size="small"
                                                onClick={() => handleRoleDown(member._id, member.role)}
                                                disabled={
                                                    member.role === "CLIENT" ||
                                                    loadingId === member._id
                                                }
                                            >
                                                <ArrowDownwardIcon fontSize="small" />
                                            </IconButton>

                                            <IconButton
                                                size="small"
                                                onClick={() => handleRoleUp(member._id, member.role)}
                                                disabled={
                                                    member.role === "OWNER" ||
                                                    (members.some((m) => m.role === "OWNER" && member.role === "ADMIN")) ||
                                                    loadingId === member._id
                                                }
                                            >
                                                {loadingId === member._id ? (
                                                    <CircularProgress size={16} />
                                                ) : (
                                                    <ArrowUpwardIcon fontSize="small" />
                                                )}
                                            </IconButton>
                                        </Stack>
                                    </Stack>
                                    <Divider />
                                </Box>
                            ))}
                        </Stack>
                    )}
                </CardContent>
            </Box>

            <SelectMemberDialog
                open={openSelectMemberDialog}
                onClose={() => setOpenSelectMemberDialog(false)}
                title="Transfer Ownership"
                description="Select a member to transfer ownership of this workspace."
                excludeUserId={user?._id}
                onSelect={(member) => {
                    updateRole(member?.memberId, "OWNER");
                }}
            />
        </Box>
    );
}