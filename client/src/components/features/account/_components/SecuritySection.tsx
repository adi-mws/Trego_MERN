import { useState } from "react";
import {
    Card, Box, Typography, Stack, TextField, Button, Divider, Switch, FormControlLabel,
    Grid,
    Chip
} from "@mui/material";
import SectionHeader from "./SectionHeader";
import { WarningAmber } from "@mui/icons-material";

function SecuritySection() {

    return (
        <Card variant="outlined" id="security">
            <Box p={3}>
                <SectionHeader
                    title="Account"
                    description="Actions related to your account"
                />

                <Typography fontWeight={600} mb={1.5}>
                    Change password
                </Typography>

                <Stack spacing={2} maxWidth={420}>
                    <TextField
                        placeholder="Enter current password"                                               
                        label="Current password"
                        type="password"
                        size="small"
                    />
                    <TextField
                        placeholder="Enter new password"                        
                        label="New password"
                        type="password"
                        size="small"
                    />
                    <TextField
                        placeholder="Enter confirm password"
                        label="Confirm new password"
                        type="password"
                        size="small"
                    />
                </Stack>

                <Stack direction="row" justifyContent="flex-end" mt={3}>
                    <Button size="small" variant="contained">
                        Update password
                    </Button>
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography fontWeight={600} mb={0.5} color="error">
                    Danger Zone
                </Typography>

                <Typography fontSize={14} color="text.secondary" mb={2}>
                    Delete your account
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={12}>
                        <Chip
                            sx={{px: 2}}
                            icon={<WarningAmber sx={{fontSize: 18}}/>}
                            label="Delete Account – This action is permanent"
                            color="error"
                            variant="outlined"
                        />
                    </Grid>

                    <Grid size={12}>
                        <Typography variant="body2" color="text.secondary">
                            Deleting your account is irreversible. All your personal data will be permanently removed.
                            If you own any servers, their ownership will be automatically transferred to another eligible member.
                        </Typography>
                    </Grid>

                    <Grid size={12}>
                        <Box mt={1}>
                            <Button variant="contained" size="small" color="error">
                                Delete Account
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Card>
    );
}


export default SecuritySection;