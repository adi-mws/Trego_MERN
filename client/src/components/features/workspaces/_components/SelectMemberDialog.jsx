import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Stack,
    Avatar,
    Box,
    Radio,
    CircularProgress,
    Divider,
} from "@mui/material";

import { callApi } from "../../../../api/api";
import { useSelector } from "react-redux";
import { getImageUrl } from "../../../../utils/image.utils";

export default function SelectMemberDialog({
    open,
    onClose,
    onSelect,
    title = "Select Member",
    description = "Choose a member from the workspace",
    excludeUserId, // optional (exclude current owner, etc.)
}) {


    const [members, setMembers] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const workspaceId = useSelector((state) => state.workspace._id);
    //Fetch members
    const fetchMembers = async () => {
        setLoading(true);

        const res = await callApi({
            method: "GET",
            url: `/workspaces/${workspaceId}/members-list?role=admin`,
        });
        if (res.success) {
            let filtered = res.data.members || [];

            // optional exclusion
            if (excludeUserId) {
                filtered = filtered.filter(
                    (m) => m.userId?._id !== excludeUserId
                );
            }

            setMembers(filtered);
        }
        else {
            console.error(res.error);
        }
        setLoading(false);

    }

    useEffect(() => {
        if (open && workspaceId) {
            fetchMembers();
            setSelectedId(null);
        }
    }, [open, workspaceId]);

    const handleConfirm = () => {
        if (!selectedId) return;

        const selectedMember = members.find(
            (m) => m._id === selectedId
        );

        onSelect && onSelect(selectedMember);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 600 }}>
                {title}
            </DialogTitle>

            <DialogContent>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    {description}
                </Typography>

                {loading ? (
                    <Stack alignItems="center" py={3}>
                        <CircularProgress size={24} />
                    </Stack>
                ) : members.length === 0 ? (
                    <Typography color="text.secondary">
                        No members available
                    </Typography>
                ) : (
                    <Stack spacing={1}>
                        {members.map((member) => (
                            <Box key={member._id}>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{
                                        p: 1,
                                        borderRadius: 2,
                                        cursor: "pointer",
                                        "&:hover": {
                                            backgroundColor: "action.hover",
                                        },
                                    }}
                                    onClick={() => setSelectedId(member._id)}
                                >
                                    {/* LEFT */}
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar src={getImageUrl(member.avatar)}>
                                            {member?.name[0]}
                                        </Avatar>

                                        <Box>
                                            <Typography fontWeight={500}>
                                                {member.name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {member?.email}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* RIGHT */}
                                    <Radio
                                        checked={selectedId === member?._id}
                                        onChange={() => setSelectedId(member?._id)}
                                    />
                                </Stack>

                                <Divider />
                            </Box>
                        ))}
                    </Stack>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Cancel</Button>

                <Button
                    variant="contained"
                    disabled={!selectedId}
                    onClick={handleConfirm}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}