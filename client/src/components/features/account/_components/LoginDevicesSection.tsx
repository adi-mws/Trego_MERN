"use client"
import {
    Card, 
    Box, 
    List, 
    ListItem, 
    ListItemAvatar, 
    Avatar, 
    Typography, 
    Stack,
    ListItemText
} from "@mui/material";

import DeviceHubIcon from '@mui/icons-material/DeviceHub';
 
function LoggedInDevicesSection() {
    const devices = [
        { id: 'd1', name: 'MacBook Pro', location: 'Home', lastSeen: '2 hours ago' },
        { id: 'd2', name: 'iPhone 14', location: 'Office', lastSeen: '1 day ago' },
    ]

    return (
        <Card variant="outlined" id="loggedInDevices">
            <Box p={3}>
                <Stack spacing={1} direction="row" alignItems="center" mb={1}>
                    <DeviceHubIcon />
                    <Typography fontWeight={600}>Logged-in Devices</Typography>
                </Stack>

                <List disablePadding>
                    {devices.map((d) => (
                        <ListItem key={d.id} secondaryAction={<Typography variant="caption">{d.lastSeen}</Typography>}>
                            <ListItemAvatar>
                                <Avatar>{d.name.split(' ').map(s => s[0]).join('').slice(0, 2)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={d.name} secondary={d.location} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Card>
    )

}

export default LoggedInDevicesSection;