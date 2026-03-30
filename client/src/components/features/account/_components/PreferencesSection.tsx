
import {
    Card, Box, Stack, Typography, Select, MenuItem, Button
} from "@mui/material";
import { useState } from "react";

import SectionHeader from "./SectionHeader";

function PreferencesSection() {
    const [theme, setTheme] = useState("system");
    const [accent, setAccent] = useState("blue");
    return (
        <Card variant="outlined" id="preferences">
            <Box p={3}>
                <SectionHeader
                    title="Preferences"
                    description="Customize your experience"
                />

                <Stack spacing={3} maxWidth={420}>
                    <Box>
                        <Typography fontSize={14} mb={0.5}>
                            Theme
                        </Typography>
                        <Select
                            size="small"
                            fullWidth
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            <MenuItem value="system">System</MenuItem>
                            <MenuItem value="light">Light</MenuItem>
                            <MenuItem value="dark">Dark</MenuItem>
                        </Select>
                    </Box>

                    <Box>
                        <Typography fontSize={14} mb={0.5}>
                            Accent color
                        </Typography>
                        <Select
                            size="small"
                            fullWidth
                            value={accent}
                            onChange={(e) => setAccent(e.target.value)}
                        >
                            <MenuItem value="blue">Blue</MenuItem>
                            <MenuItem value="green">Green</MenuItem>
                            <MenuItem value="purple">Purple</MenuItem>
                            <MenuItem value="orange">Orange</MenuItem>
                        </Select>
                    </Box>
                </Stack>

                <Stack direction="row" justifyContent="flex-end" mt={3}>
                    <Button size="small" variant="contained">
                        Save preferences
                    </Button>
                </Stack>
            </Box>
        </Card>
    );
}


export default PreferencesSection;