import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  CircularProgress,
  Tooltip,
  IconButton,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { PROJECT_ROUTES } from "../../../lib/routes";
import { useSelector } from "react-redux";
import { callApi } from "../../../api/api";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ProjectPermissionGate from "./_components/ProjectPermissionGate";

function groupWorkflows(workflows = []) {
  const groups = new Map();

  workflows.forEach((workflow) => {
    const rootId = String(workflow.originalWorkflowId || workflow._id);
    const originalId = workflow.originalWorkflowId ? String(workflow.originalWorkflowId) : String(workflow._id);
    if (!groups.has(rootId)) {
      groups.set(rootId, {
        rootId,
        name: workflow.name,
        originalId,
        workflows: [],
      });
    }

    groups.get(rootId).workflows.push(workflow);
  });

  return [...groups.values()].map((group) => {
    const workflowsByVersion = group.workflows.sort((a, b) => (b.version || 0) - (a.version || 0));
    const originalWorkflow = workflowsByVersion.find((wf) => String(wf._id) === group.originalId) || workflowsByVersion[workflowsByVersion.length - 1] || workflowsByVersion[0];
    const latestWorkflow = workflowsByVersion[0];

    return {
      ...group,
      name: originalWorkflow?.name || group.name,
      originalWorkflow,
      latestWorkflow,
      workflows: workflowsByVersion,
    };
  }).sort((a, b) => {
    const aLatest = a.latestWorkflow?.version || 0;
    const bLatest = b.latestWorkflow?.version || 0;
    if (aLatest !== bLatest) return bLatest - aLatest;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

export default function ProjectWorkflowsList() {
  const navigate = useNavigate();
  const { workspaceSlug, projectSlug } = useParams();

  const { _id: projectId } = useSelector((state) => state.project);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState({});

  useEffect(() => {
    const fetchWorkflows = async () => {
      if (!projectId) return;
      setLoading(true);
      const res = await callApi({ method: "get", url: `/workflows/project/${projectId}` });
      if (res.success) {
        const items = res.data.data || [];
        setWorkflows(items);
        const groups = groupWorkflows(items);
        setSelectedVersions((prev) => {
          const next = {};
          groups.forEach((group) => {
            const existing = prev[group.rootId];
            const stillExists = group.workflows.some((wf) => wf._id === existing);
            const preferred = group.originalWorkflow?._id || "";
            next[group.rootId] = preferred || (stillExists ? existing : group.workflows[0]?._id || "");
          });
          return next;
        });
      }
      setLoading(false);
    };

    fetchWorkflows();
  }, [projectId]);

  const groupedWorkflows = useMemo(() => groupWorkflows(workflows), [workflows]);

  const handleCreate = async () => {
    if (!projectId) return;
    const res = await callApi({ method: "post", url: `/workflows`, data: { projectId, name: "New Workflow" } });
    if (res.success) {
      const newWf = res.data.data;
      navigate(PROJECT_ROUTES.projectWorkflowDetail(workspaceSlug, projectSlug, newWf._id));
    }
  };

  const handleDelete = async (workflowId) => {
    const res = await callApi({ method: "delete", url: `/workflows/${workflowId}` });
    if (res.success) {
      setWorkflows((prev) => prev.filter((wf) => wf._id !== workflowId));
      setSelectedVersions((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((rootId) => {
          if (next[rootId] === workflowId) {
            delete next[rootId];
          }
        });
        return next;
      });
    } else {
      console.error("Failed to delete workflow");
    }
  };

  return (
    <ProjectPermissionGate
      permission="canManageProject"
      title="You do not have permission to manage workflows"
      message="Ask a project admin to edit workflows."
    >
      <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={500}>
              Workflows
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Versions are grouped so you can switch between v1, v2, and later revisions in one place.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Workflow
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: "background.default" }}>
                <TableRow>
                  <TableCell>Workflow</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Editable</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedWorkflows.map((group) => {
                  const selectedWorkflowId = selectedVersions[group.rootId] || group.originalWorkflow?._id || group.workflows[0]?._id;
                  const selectedWorkflow = group.workflows.find((wf) => wf._id === selectedWorkflowId) || group.workflows[0];
                  const originalWorkflow = group.originalWorkflow || group.workflows[group.workflows.length - 1] || group.workflows[0];
                  const latestWorkflow = group.latestWorkflow || group.workflows[0];

                  return (
                    <TableRow key={group.rootId} hover>
                      <TableCell sx={{ fontWeight: 500 }}>
                        <Stack spacing={0.5}>
                          <Typography fontWeight={600}>{group.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Original V{originalWorkflow?.version || 1}
                            {latestWorkflow && String(latestWorkflow._id) !== String(originalWorkflow?._id) ? ` | Latest V${latestWorkflow.version || 1}` : ""}
                          </Typography>
                          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                            {group.workflows.map((wf) => {
                              const isOriginal = String(wf._id) === String(originalWorkflow?._id);
                              const isLatest = String(wf._id) === String(latestWorkflow?._id);

                              return (
                                <Chip
                                  key={wf._id}
                                  label={`V${wf.version}${isOriginal ? " original" : ""}${isLatest && !isOriginal ? " latest" : ""}`}
                                  size="small"
                                  color={selectedWorkflow?._id === wf._id ? "primary" : "default"}
                                  variant={selectedWorkflow?._id === wf._id ? "filled" : "outlined"}
                                />
                              );
                            })}
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Choose version</InputLabel>
                          <Select
                            label="Choose version"
                            value={selectedWorkflowId || ""}
                            onChange={(e) =>
                              setSelectedVersions((prev) => ({
                                ...prev,
                                [group.rootId]: e.target.value,
                              }))
                            }
                            IconComponent={KeyboardArrowDownIcon}
                          >
                            {group.workflows.map((wf) => {
                              const isOriginal = String(wf._id) === String(originalWorkflow?._id);
                              const isLatest = String(wf._id) === String(latestWorkflow?._id);

                              return (
                                <MenuItem key={wf._id} value={wf._id}>
                                  V{wf.version}
                                  {isOriginal ? " (original)" : wf.originalWorkflowId ? " (clone)" : ""}
                                  {isLatest && !isOriginal ? " (latest)" : ""}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.75}>
                          <Chip
                            label={selectedWorkflow?.isActive ? "Active" : "Draft"}
                            color={selectedWorkflow?.isActive ? "success" : "default"}
                            size="small"
                          />
                          {(selectedWorkflow?.usage?.totalCount > 0 || selectedWorkflow?.categoryIds?.length > 0) && (
                            <Chip
                              label={`Used by ${selectedWorkflow?.usage?.taskCount || 0} tasks, ${selectedWorkflow?.usage?.categoryCount || 0} categories`}
                              color="warning"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={selectedWorkflow?.isEditable ? "Yes" : "Read-only"}
                          color={selectedWorkflow?.isEditable ? "primary" : "error"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              navigate(PROJECT_ROUTES.projectWorkflowDetail(workspaceSlug, projectSlug, selectedWorkflow._id))
                            }
                          >
                            Open
                          </Button>
                          <Tooltip title={(selectedWorkflow.usage?.totalCount > 0 || selectedWorkflow.categoryIds?.length > 0) ? "This workflow is currently used, so it cannot be deleted." : "Delete Workflow"}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(selectedWorkflow._id)}
                                disabled={selectedWorkflow.usage?.totalCount > 0 || selectedWorkflow.categoryIds?.length > 0}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </ProjectPermissionGate>
  );
}
