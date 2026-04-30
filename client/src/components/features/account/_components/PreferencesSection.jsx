import {
    Box,
    Stack,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    FormControlLabel,
    Switch,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

import SectionHeader from "./SectionHeader";
import { useUserGlobal } from "../../../../hooks/useUserGlobal";
import { useNotification } from "../../../../hooks/useNotification";
import { callApi } from "../../../../api/api";
import { useAlert } from "../../../../hooks/useAlert";

const accentColors = [
    "#1976d2", // blue
    "#2e7d32", // green
    "#9c27b0", // purple
    "#ed6c02", // orange
    "#d32f2f", // red
    "#0288d1", // cyan
    "#c2185b", // pink
    "#7b1fa2", // deep purple
    "#455a64", // slate
    "#f9a825", // yellow
];

function PreferencesSection() {
    const [theme, setTheme] = useState("system");
    const [accent, setAccent] = useState("#1976d2");
    const [importantOnly, setImportantOnly] = useState(false);
    const { user, updatePrefs } = useUserGlobal();
    const { fetchNotifications } = useNotification();
    const showAlert = useAlert();
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

    const handleThemeChange = async (value) => {
        setTheme(value);

        const response = await callApi({
            method: "PUT",
            url: "/user/preferences",
            data: { theme: value, accentColor: accent, importantNotificationsOnly: importantOnly },
        });

        if (response.success) {
            updatePrefs({ theme: value, accentColor: accent, importantNotificationsOnly: importantOnly });
        } else {
            showAlert(response.error?.message, "error");
        }
    };


    const handleAccentChange = async (color) => {
        setAccent(color);

        const response = await callApi({
            method: "PUT",
            url: "/user/preferences",
            data: { theme, accentColor: color, importantNotificationsOnly: importantOnly },
        });

        if (response.success) {
            updatePrefs({ theme, accentColor: color, importantNotificationsOnly: importantOnly });
        } else {
            showAlert(response.error?.message, "error");
        }
    };

    const handleNotificationPreferenceChange = async (event) => {
        const value = event.target.checked;
        setImportantOnly(value);

        const response = await callApi({
            method: "PUT",
            url: "/user/preferences",
            data: { theme, accentColor: accent, importantNotificationsOnly: value },
        });

        if (response.success) {
            updatePrefs({ theme, accentColor: accent, importantNotificationsOnly: value });
            fetchNotifications();
        } else {
            setImportantOnly(!value);
            showAlert(response.error?.message, "error");
        }
    };

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (user?.preferences) {
                setTheme(user.preferences.theme || "system");
                setAccent(user.preferences.accentColor || "#1976d2");
                setImportantOnly(Boolean(user.preferences.importantNotificationsOnly));
            }
        }, 0);

        return () => window.clearTimeout(timer);
    }, [user]);
    return (
        <Box id="preferences">
            <Box p={{ xs: 2, sm: 3 }} sx={{ minWidth: 0 }}>
                <SectionHeader
                    title="Preferences"
                    description="Customize your experience"
                />

                <Stack spacing={4} maxWidth={420} sx={{ width: "100%" }}>
                    {/* THEME SELECTOR */}
                    <Box>
                        <Typography fontSize={14} mb={1}>
                            Theme
                        </Typography>

                        <ToggleButtonGroup
                            value={theme}
                            onChange={(e, val) => val && handleThemeChange(val)}
                            exclusive
                            fullWidth
                            size="small"
                            orientation={isMobile ? "vertical" : "horizontal"}
                            sx={{
                                "& .MuiToggleButton-root": {
                                    flex: 1,
                                },
                                "& .MuiToggleButtonGroup-grouped": {
                                    minWidth: 0,
                                },
                            }}
                        >
                            <ToggleButton value="system">System</ToggleButton>
                            <ToggleButton value="light">Light</ToggleButton>
                            <ToggleButton value="dark">Dark</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* ACCENT SELECTOR */}
                    <Box>
                        <Typography fontSize={14} mb={1}>
                            Accent Color
                        </Typography>

                        <Stack direction="row" flexWrap="wrap" gap={1.5} useFlexGap>
                            {accentColors.map((color) => (
                                <Box
                                    onClick={() => handleAccentChange(color)}
                                    key={color}
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        bgcolor: color,
                                        cursor: "pointer",
                                        border:
                                            accent === color
                                                ? "3px solid #000"
                                                : "2px solid transparent",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            transform: "scale(1.1)",
                                        },
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>

                    <Box>
                        <Typography fontSize={14} mb={1}>
                            Notifications
                        </Typography>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={importantOnly}
                                    onChange={handleNotificationPreferenceChange}
                                />
                            }
                            label="Only important notifications"
                            sx={{
                                m: 0,
                                alignItems: "center",
                                "& .MuiFormControlLabel-label": {
                                    fontSize: 14,
                                },
                            }}
                        />
                    </Box>
                </Stack>

                <Stack direction="row" justifyContent="flex-end" mt={3}>

                </Stack>
            </Box>
        </Box>
    );
}

export default PreferencesSection;
