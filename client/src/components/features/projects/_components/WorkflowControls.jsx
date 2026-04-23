import React, { useState } from 'react'
import { Stack, IconButton, Tooltip, Divider, useTheme } from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import AddIcon from "@mui/icons-material/AddOutlined";
import SettingsIcon from "@mui/icons-material/TuneOutlined";
import { useDispatch, useSelector } from "react-redux";
import { addNode, deleteNode, deleteEdge } from "../../../../redux/slices/workflowSlice";
import WorkflowSettingsDialog from "./WorkflowSettingsDialog";

export default function WorkflowControls({ workflowActions }) {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { selectedNode, selectedEdge } = useSelector((state) => state.workflow);
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <>
            <Stack
                position={'fixed'}
                left={"50%"}
                sx={{
                    transform: "translateX(-50%)",
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                }}
                justifyContent={'center'}
                bottom={16}
                spacing={0}
                px={1}
                direction={"row"}
                alignItems="center"
            >
                <Stack direction="row" spacing={0} justifyContent={"center"} alignItems="center">
                    <Tooltip title="Add Stage">
                        <span><IconButton onClick={() => dispatch(addNode())}><AddIcon sx={{ fontSize: 20 }} /></IconButton></span>
                    </Tooltip>

                    <Tooltip title="Delete Selected">
                        <span>
                            <IconButton
                                disabled={!selectedNode && !selectedEdge}
                                onClick={() => {
                                    if (selectedNode) dispatch(deleteNode(selectedNode.id));
                                    if (selectedEdge) dispatch(deleteEdge(selectedEdge.id));
                                }}
                            >
                                <DeleteIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

                    <Tooltip title="Auto Layout">
                        <span><IconButton onClick={workflowActions.recalculateFlow}><AccountTreeIcon sx={{ fontSize: 20 }} /></IconButton></span>
                    </Tooltip>

                    <Tooltip title="Vertical Layout">
                        <span><IconButton onClick={workflowActions.verticalView}><VerticalAlignTopIcon sx={{ fontSize: 20 }} /></IconButton></span>
                    </Tooltip>

                    <Tooltip title="Horizontal Layout">
                        <span><IconButton onClick={workflowActions.horizontalView}><HorizontalRuleIcon sx={{ fontSize: 20 }} /></IconButton></span>
                    </Tooltip>

                    <Tooltip title="Fit View">
                        <span><IconButton onClick={workflowActions.centerView}><CenterFocusStrongIcon sx={{ fontSize: 20 }} /></IconButton></span>
                    </Tooltip>

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

                    <Tooltip title="Workflow Settings">
                        <span>
                            <IconButton onClick={() => setSettingsOpen(true)}>
                                <SettingsIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            </Stack>

            <WorkflowSettingsDialog
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
            />
        </>
    );
}
