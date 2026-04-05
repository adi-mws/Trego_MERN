import {
    Box,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    Typography,
    Stack,
    ListItemText,
    Chip,
    Divider,
    IconButton,
    Tooltip,
} from "@mui/material";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import LogoutIcon from "@mui/icons-material/Logout";
import { useUserGlobal } from "../../../../hooks/useUserGlobal";
import { callApi } from "../../../../api/api";
import GoogleIcon from "@mui/icons-material/Google";
import EmailIcon from "@mui/icons-material/Email";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../../../../hooks/useConfirm";

function LoggedInDevicesSection() {
    const { user, updateUser } = useUserGlobal();
    const [loadingId, setLoadingId] = useState(null);
    const showConfirm = useConfirm();
    const sessions = user?.sessions || [];
    const navigate = useNavigate();

    const getDeviceIcon = (os = "") => {
        if (os.toLowerCase().includes("android") || os.toLowerCase().includes("ios")) {
            return <SmartphoneIcon fontSize="small" />;
        }

        return <LaptopMacIcon fontSize="small" />;
    };

    const getProviderIcon = (provider) => {
        switch (provider) {
            case "GOOGLE":
                return <GoogleIcon fontSize="small" />;
            case "LOCAL":
                return <EmailIcon fontSize="small" />;
            default:
                return null;
        }
    };

    const formatLastSeen = (date) => {
        if (!date) return "Unknown";

        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);

        if (mins < 60) return `${mins} min ago`;
        if (hours < 24) return `${hours} hr ago`;
        return `${days} day ago`;
    };

    const handleLogoutSession = async (sessionId) => {

        const ok = await showConfirm({title: "Logout Session", message: "Are you sure you want to log out this device?"}, {
        
        });
        if (!ok) return;
        try {
            setLoadingId(sessionId);

            const res = await callApi({
                method: "DELETE",
                url: `/auth/sessions/${sessionId}`,
            });


            if (res?.success) {
                const updatedSessions = sessions.filter((s) => s.id !== sessionId);
                if (user?.currentSessionId === sessionId) {
                    // If the user is logging out of the current session, we should also update
                    //  the global user state to reflect that there is no active session.
                    updateUser({});
                    navigate("/sign-in");
                } else {
                    updateUser({
                        ...user,
                        sessions: updatedSessions,
                    });
                }


            }
        } catch (err) {
            console.error("Failed to revoke session", err);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <Box id="loggedInDevices">
            <Box p={3}>
                {/* Header */}
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <DeviceHubIcon />
                    <Typography fontWeight={600}>Logged-in Devices</Typography>
                </Stack>

                {/* List */}
                <List disablePadding>
                    {sessions.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                            No active sessions
                        </Typography>
                    )}

                    {sessions.map((s, index) => (
                        <Box key={s.id}>
                            <ListItem
                                secondaryAction={

                                    <Stack direction="row" spacing={1} alignItems="center">

                                        {/* Last seen */}
                                        <Stack direction="row" spacing={0.75} alignItems="center">
                                            {/* Time */}
                                            <Typography variant="caption" color="text.secondary">
                                                {formatLastSeen(s.lastActiveAt)}
                                            </Typography>

                                            {/* Provider Icon with Tooltip */}
                                            <Tooltip
                                                title={
                                                    s.provider === "GOOGLE"
                                                        ? "Google Provider"
                                                        : "Credential Provider"
                                                }
                                                arrow
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        color: "primary.main", // theme primary color
                                                    }}
                                                >
                                                    {getProviderIcon(s.provider)}
                                                </Box>
                                            </Tooltip>
                                        </Stack>

                                        {/* Current badge */}
                                        {s.isCurrent && (
                                            <Chip label="Current" size="small" color="success" />
                                        )}

                                        {/* Logout Button */}
                                        <Tooltip title="Logout device">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleLogoutSession(s.id)}
                                                    disabled={loadingId === s.id}
                                                >
                                                    <LogoutIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar>{getDeviceIcon(s.os)}</Avatar>
                                </ListItemAvatar>

                                <ListItemText
                                    primary={`${s.browser || "Unknown"} • ${s.os || "Device"}`}
                                    secondary={s.ipAddress || "Unknown location"}
                                />
                            </ListItem>

                            {index !== sessions.length - 1 && <Divider />}
                        </Box>
                    ))}
                </List>
            </Box>
        </Box>
    );
}

export default LoggedInDevicesSection;