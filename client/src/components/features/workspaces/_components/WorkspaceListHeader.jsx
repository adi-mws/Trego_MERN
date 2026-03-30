import { useState } from "react";
import {
    Stack,
    Tab,
    Tabs,
    Typography,
    Box,
    IconButton,
    Chip,
    Divider,
} from "@mui/material";

import ViewModuleOutlinedIcon from "@mui/icons-material/ViewModuleOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";

import { WorkspaceHomeFilters } from "@/features/workspace/workspace.query";


export default function WorkspacesListHeader({
    filters,
    onFiltersChange,
}) {
    const [tab, setTab] = useState(0);
    const [view, setView] = useState("card");

    const handleRoleToggle = (role) => {
        onFiltersChange({
            ...filters,
            role: filters.role === role ? undefined : role,
        });
    };

    const handleTabChange = (_, v) => {
        setTab(v);

        if (v === 1) {
            onFiltersChange({ ...filters, ownership: "CREATED_BY_ME" });
        } else if (v === 2) {
            onFiltersChange({ ...filters, ownership: "SHARED_WITH_ME" });
        } else {
            onFiltersChange({ ...filters, ownership: undefined });
        }
    };

    return (
        <Stack spacing={1.5}>
            {/* Row 1 */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" fontWeight={300}>
                    Workspaces
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        gap: 0.5,
                        p: 0.5,
                        borderRadius: 2,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <IconButton
                        size="small"
                        onClick={() => setView("card")}
                        sx={{
                            borderRadius: 1.5,
                            bgcolor: view === "card" ? "action.selected" : "transparent",
                        }}
                    >
                        <ViewModuleOutlinedIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                        size="small"
                        onClick={() => setView("list")}
                        sx={{
                            borderRadius: 1.5,
                            bgcolor: view === "list" ? "action.selected" : "transparent",
                        }}
                    >
                        <ViewListOutlinedIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Stack>

            {/* Row 2 */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                {/* Tabs */}
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    TabIndicatorProps={{ style: { display: "none" } }}
                    sx={{
                        minHeight: "auto",
                        "& .MuiTabs-flexContainer": { gap: 1 },
                    }}
                >
                    {["Recent", "Created by you", "Shared with you"].map(
                        (label, index) => (
                            <Tab
                                key={label}
                                label={label}
                                sx={{
                                    textTransform: "none",
                                    fontSize: 13,
                                    minHeight: "auto",
                                    px: 2,
                                    py: 0.75,
                                    borderRadius: 2,
                                    bgcolor: tab === index ? "background.paper" : "transparent",
                                    border: "1px solid",
                                    borderColor: tab === index ? "divider" : "transparent",
                                    "&:hover": {
                                        bgcolor: "action.hover",
                                    },
                                }}
                            />
                        )
                    )}
                </Tabs>

                {/* Role filter */}
                <Stack direction="row" spacing={1}>
                    <Chip
                        label="Admin"
                        size="small"
                        clickable
                        onClick={() => handleRoleToggle("ADMIN")}
                        variant={filters.role === "ADMIN" ? "filled" : "outlined"}
                        color={filters.role === "ADMIN" ? "primary" : "default"}
                        sx={{ fontSize: 11, height: 24 }}
                    />

                    <Chip
                        label="Member"
                        size="small"
                        clickable
                        onClick={() => handleRoleToggle("MEMBER")}
                        variant={filters.role === "MEMBER" ? "filled" : "outlined"}
                        color={filters.role === "MEMBER" ? "primary" : "default"}
                        sx={{ fontSize: 11, height: 24 }}
                    />
                </Stack>
            </Stack>

            <Divider />
        </Stack>
    );
}