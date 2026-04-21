import { Box, TextField, IconButton, Tooltip, Stack } from "@mui/material";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

export default function WorkflowSidebarHeader({
  workflowName,
  onChangeName,
  onSave,
  isSaving = false,
  isDirty = false,
}) {
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
        <FiberManualRecordIcon
          sx={{
            fontSize: 10,
            color: isSaving
              ? "warning.main"     
              : isDirty
              ? "warning.main"     
              : "success.main",   
          }}
        />

        {/* Workflow Name */}
        <TextField
          variant="standard"
          placeholder="Untitled Workflow"
          value={workflowName}
          onChange={(e) => onChangeName(e.target.value)}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: 15,
              fontWeight: 500,
            },
          }}
          sx={{
            flex: 1,
          }}
        />
      </Stack>

      {/* RIGHT: Save Icon */}
      <Tooltip
        title={
          isSaving
            ? "Saving..."
            : isDirty
            ? "Save changes"
            : "Saved"
        }
      >
        <span>
          <IconButton
            onClick={onSave}
            disabled={!isDirty && !isSaving}
            sx={{
              ml: 1,
            }}
          >
            {isSaving ? (
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
    </Box>
  );
}