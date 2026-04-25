import { Box, IconButton, Tooltip, Stack, Typography, Switch, FormControlLabel, Chip, Button, CircularProgress } from "@mui/material";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setIsActive, saveWorkflowTemplate, cloneWorkflowVersion } from "../../../../redux/slices/workflowSlice";
import { selectWorkflowEligibility } from "../../../../redux/selectors/workflowSelectors";
import { useParams, useNavigate } from "react-router-dom";
import { PROJECT_ROUTES } from "../../../../lib/routes";

export default function WorkflowSidebarHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workspaceSlug, projectSlug, workflowId } = useParams();
  const { isSaving, isDirty, name, description, nodes, edges, isWorking, isActive, isEditable, version, usage } = useSelector((state) => state.workflow);
  const eligibility = useSelector(selectWorkflowEligibility);

  useEffect(() => {
    if (!workflowId || !isEditable || !isDirty || isSaving) return;

    const timer = window.setTimeout(() => {
      dispatch(saveWorkflowTemplate(workflowId));
    }, 650);

    return () => window.clearTimeout(timer);
  }, [workflowId, isEditable, isDirty, isSaving, name, description, nodes, edges, isActive, dispatch]);

  const handleSave = () => {
    if (workflowId) {
      dispatch(saveWorkflowTemplate(workflowId));
    }
  };

  const handleRegenerate = async () => {
    if (workflowId) {
      try {
        const newWorkflow = await dispatch(cloneWorkflowVersion(workflowId)).unwrap();
        navigate(PROJECT_ROUTES.projectWorkflowDetail(workspaceSlug, projectSlug, newWorkflow._id));
      } catch (err) {
        console.error("Failed to regenerate workflow", err);
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        gap: 1,
      }}
    >
      {/* LEFT: Name + Status */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>

        {/* Status Dot */}


        <Box sx={{ position: "relative", display: "inline-flex", minWidth: 20 }}>
          {/* Spinner */}
          {isSaving && (
            <CircularProgress
              size={16}
              thickness={5}
              color="warning"
            />
          )}

          {/* Centered dot */}
          <FiberManualRecordIcon
            sx={{
              fontSize: 8,
              color: isSaving
                ? "warning.main"
                : !eligibility.isEligible
                  ? "error.main"
                  : isDirty
                    ? "warning.main"
                    : "success.main",
              position: "absolute",
              top: "50%",
              left: "40%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </Box>

        {/* Workflow Name */}
        <Typography 
            title={name || "Untitled Workflow"}
            sx={{ 
                fontSize: 14, 
                fontWeight: 600, 
                flex: 1, 
                ml: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 90,
            }}
        >
            {(name || "Untitled").length > 8 ? (name || "Untitled").slice(0, 8) + "…" : (name || "Untitled")}
        </Typography>

        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
          <Chip label={`V${version || 1}`} size="small" color="primary" variant="outlined" />
          {usage?.totalCount > 0 && (
            <Chip
              label={`Used in ${usage.totalCount}`}
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
        </Stack>
      </Stack>

      {/* RIGHT: Save & Status Icons */}
      <Stack direction="row" alignItems="center" spacing={1}>
        {!isEditable ? (
          <Button variant="outlined" size="small" color="primary" onClick={handleRegenerate}>
            Regenerate
          </Button>
        ) : (
          <>
            {/* Active/Draft Toggle */}
            <Tooltip
              title={
                isWorking
                  ? "Cannot toggle off while workflow is in use by tasks or categories."
                  : !eligibility.isEligible
                    ? "Workflow has errors and cannot be active."
                    : isActive
                      ? "Set to Draft"
                      : "Set to Active"
              }
            >
              <span>
                <FormControlLabel
                  sx={{ m: 0, mr: 1 }}
                  control={
                    <Switch
                      checked={isActive}
                      onChange={(e) => dispatch(setIsActive(e.target.checked))}
                      disabled={isWorking || (!isActive && !eligibility.isEligible)}
                      size="small"
                      color="success"
                    />
                  }
                />
              </span>
            </Tooltip>

        {isWorking && (
          <Tooltip title="Workflow is currently in use by tasks or categories">
            <PlayCircleOutlineIcon sx={{ color: "success.main", fontSize: 20, mr: 1 }} />
          </Tooltip>
        )}

        <Tooltip
          title={
            (isWorking && !eligibility.isEligible)
              ? `Cannot Save Active Workflow:\n${eligibility.errors.join("\n")}`
              : !eligibility.isEligible
                ? `Cannot Activate:\n${eligibility.errors.join("\n")}`
                : isSaving
                  ? "Saving..."
                  : isDirty
                    ? "Save changes"
                    : "Active (Saved)"
          }
        >
          <span>
            <IconButton
              onClick={handleSave}
              disabled={(!isDirty && !isSaving) || (isWorking && !eligibility.isEligible)}
              sx={{
                ml: 1,
              }}
            >
              {!eligibility.isEligible ? (
                <CloudOffIcon sx={{ fontSize: 22, color: "error.main" }} />
              ) : isSaving ? (
                <CloudUploadIcon sx={{ fontSize: 22 }} />
              ) : (
                <CloudDoneIcon
                  sx={{
                    fontSize: 22,
                    color: isDirty ? "warning.main" : "success.main",
                  }}
                />
              )}
            </IconButton>
          </span>
        </Tooltip>
        </>
        )}
      </Stack>
    </Box>
  );
}
