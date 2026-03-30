import { useState } from "react";
import {
    Avatar,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Typography,
    Divider,
    Button,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { AUTH_ROUTES } from "../../../lib/routes";
import { useNavigate } from "react-router-dom";
export default function UserMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
const navigate = useNavigate();

    const data = {}
    // TODO: importing the redux auth hook
    // console.log(data)
    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Stack direction="row" spacing={1} alignItems="center">

            {/* Avatar + Profile Name */}
            <Button
                onClick={handleOpen}
                size="small"
                sx={{
                    textTransform: "none",
                    color: "text.primary",
                    px: 1,
                    gap: 1,
                    fontWeight: 500,
                }}
            >
                <Avatar
                    sx={{
                        width: 35,
                        height: 35,
                        bgcolor: "primary.main",
                        fontSize: 13,
                        fontWeight: 600,
                    }}
                    src={data?.user?.image || undefined}
                >
                    {data?.user?.name ? data?.user?.name.charAt(0).toUpperCase() : "U"}
                </Avatar>

                <Typography variant="body2" fontWeight={500}>
                    {data?.user?.name || "User"}
                </Typography>

                <KeyboardArrowDownIcon
                    fontSize="small"
                    sx={{
                        color: "text.secondary",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "0.2s",
                    }}
                />
            </Button>



            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                    sx: {
                        fontSize: 14,
                        mt: 1,
                        minWidth: 240,
                        borderRadius: 2,
                    },
                }}
            >
                {/* User info */}
                <Box sx={{ px: 2, py: 2 }}>
                    <Typography fontSize={14} fontWeight={600}>{data?.user?.name || "User"}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {data?.user?.email || "No email"}
                    </Typography>
                </Box>

                <Divider />

                <MenuItem
                    sx={{ fontSize: 14 }}
                    onClick={() => {
                        handleClose();
                        navigate(AUTH_ROUTES.root);
                    }}
                >
                    Account
                </MenuItem>

                <MenuItem onClick={() => {
                    handleClose();
                    // router.push(AUTH_ROUTES.preference);
                }} sx={{ fontSize: 'inherit' }}
                >
                    Preferences
                </MenuItem>

                <Divider />

                <MenuItem
                    onClick={() => {
                        // todo: sign up and sign in simulatenously
                        handleClose();
                    }}
                    sx={{ color: "error.main", fontWeight: 500, fontSize: 'inherit' }}
                >
                    Sign out
                </MenuItem>
            </Menu>
        </Stack>
    );
}
