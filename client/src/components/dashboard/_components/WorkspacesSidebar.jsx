import { Box, Stack, Typography } from "@mui/material";
import WorkspacesOutlinedIcon from "@mui/icons-material/WorkspacesOutlined";
import { MARKETING_ROUTES, NOTIFICATION_ROUTES } from "../../../lib/routes";
import { NotificationsOutlined } from "@mui/icons-material";
import { useLocation } from "react-router-dom"
import { Link } from "react-router-dom";

const NAV_ITEMS = [
    {
        label: "Workspaces",
        icon: <WorkspacesOutlinedIcon fontSize="small" />,
        to: MARKETING_ROUTES.home,
        isActive: (pathname) =>
            pathname.startsWith(APP_ROUTES.home),
    },
    {
        label: "Notifications",
        icon: <NotificationsOutlined fontSize="small" />,
        to: NOTIFICATION_ROUTES.root,
        isActive: (pathname) =>
            pathname.startsWith(NOTIFICATION_ROUTES.root),
    },
];


export default function WorkspacesSidebar() {
    const location = useLocation();
    const pathname = location.pathname;

    return (
        <Stack spacing={1}>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, px: 1 }}
            >
                Menu
            </Typography>

            {NAV_ITEMS.map((item) => {
                const active = item.isActive(pathname);

                return (
                    <Box
                        key={item.href}
                        component={Link}
                        to={item.to}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            px: 1.5,
                            py: 1.2,
                            borderRadius: 1,
                            textDecoration: "none",
                            fontSize: 14,
                            fontWeight: active ? 600 : 500,
                            bgcolor: active ? "primary.main" : "transparent",
                            color: active
                                ? "primary.contrastText"
                                : "text.secondary",
                            transition: "background-color 0.2s ease, color 0.2s ease",
                            "&:hover": {
                                bgcolor: active
                                    ? "primary.main"
                                    : "action.hover",
                                color: active
                                    ? "primary.contrastText"
                                    : "primary.main",
                            },
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </Box>
                );
            })}
        </Stack>
    );
}
