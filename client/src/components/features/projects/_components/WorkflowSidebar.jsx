import { Box, Typography, Divider } from "@mui/material";
import { useEffect, useCallback } from "react";
import { debounce } from 'lodash';

import { useDispatch, useSelector } from "react-redux"
import WorkflowNodesNotSelected from "./WorkflowNodesNotSelected";
import WorkflowSidebarHeader from "./WorkflowSIdebarHeader";
import WorkflowEdgeEditor from "./WorkflowEdgeEditor";
import WorkflowNodeEditor from "./WorkflowNodeEditor";
import { saveWorkflowTemplate } from "../../../../redux/slices/workflowSlice";
import { useParams } from "react-router-dom";

export default function WorkflowSidebar() {
  const { selectedEdge, selectedNode, isDirty, isSaving } = useSelector((state) => state.workflow);
  const dispatch = useDispatch();

  // console.log('WorkflowSidebar render, selectedNode:', selectedNode, 'selectedEdge:', selectedEdge);

  const { workflowId } = useParams();

  const debouncedSave = useCallback(debounce((id) => {
    if (id) {
      dispatch(saveWorkflowTemplate(id));
    }
  }, 1000), [dispatch]);

  useEffect(() => {
    if (isDirty && !isSaving) {
      debouncedSave(workflowId);
    }
  }, [isDirty, isSaving, debouncedSave, workflowId]);

  return (
    <Box
      sx={{
        width: 300,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid",
        borderColor: "divider",
      }}
    >

      {/* Controls */}

      <WorkflowSidebarHeader workflowName={"Development Workflow"} />


      {/* Workflow Controls */}



      <Divider sx={{ my: 1 }} />

      {/* Workflow Sidebar Main Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          minHeight: 0,
        }}>
        {(!selectedNode && !selectedEdge) ? (
            <WorkflowNodesNotSelected />
          ) : selectedNode ? (
            <WorkflowNodeEditor />
          ) : (
            <WorkflowEdgeEditor />
          )}
      </Box>

    </Box>
  );
}