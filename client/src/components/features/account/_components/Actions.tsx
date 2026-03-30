"use client"

import {
    Stack, Button
} from "@mui/material";

function Actions() {
    return (
        <Stack direction="row" justifyContent="flex-end" mt={3} gap={1}>
            <Button size="small" variant="text">
                Cancel
            </Button>
            <Button size="small" variant="contained">
                Save changes
            </Button>
        </Stack>
    );
}


export default Actions;