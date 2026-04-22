import React from 'react'
import { Stack, IconButton, Tooltip, useTheme } from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import AddIcon from "@mui/icons-material/AddOutlined"
export default function WorkflowControls({ workflowActions }) {
    const theme = useTheme();
    return (
        <Stack position={'fixed'} left={"50%"} sx={{transform: "translateX(-50%)", background: theme.palette.background.paper}} justifyContent={'center'} bottom={10} spacing={1} px={1} direction={"row"}>

            {/* Row 1 */}
            <Stack direction="row" spacing={2} justifyContent={"center"} alignItems="center">
                <Tooltip title="Add Stage">
                    <span><IconButton disabled><AddIcon sx={{ fontSize: 20 }} /></IconButton></span>
                </Tooltip>

                <Tooltip title="Delete Selected">
                    <span><IconButton disabled><DeleteIcon sx={{ fontSize: 20 }} /></IconButton></span>
                </Tooltip>

                <Tooltip title="Recalculate Flow">
                    <span><IconButton onClick={workflowActions.recalculateFlow}><AccountTreeIcon sx={{ fontSize: 20 }} /></IconButton></span>
                </Tooltip>

                <Tooltip title="Vertical Layout">
                    <span><IconButton onClick={workflowActions.verticalView}><VerticalAlignTopIcon sx={{ fontSize: 20 }} /></IconButton></span>
                </Tooltip>

                <Tooltip title="Horizontal Layout">
                    <span><IconButton onClick={workflowActions.horizontalView}><HorizontalRuleIcon sx={{ fontSize: 20 }} /></IconButton></span>
                </Tooltip>

                <Tooltip title="Center View">
                    <span><IconButton onClick={workflowActions.centerView}><CenterFocusStrongIcon sx={{ fontSize: 20 }} /></IconButton></span>
                </Tooltip>


            </Stack>

        </Stack>
    )
}
