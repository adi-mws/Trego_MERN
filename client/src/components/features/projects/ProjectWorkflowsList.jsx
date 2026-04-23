import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { PROJECT_ROUTES } from "../../../lib/routes";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { callApi } from "../../../api/api";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Tooltip, IconButton } from "@mui/material";

export default function ProjectWorkflowsList() {
    const navigate = useNavigate();
    const { workspaceSlug, projectSlug } = useParams();

    const { _id: projectId } = useSelector(state => state.project);
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkflows = async () => {
            if (!projectId) return;
            setLoading(true);
            const res = await callApi({ method: "get", url: `/workflows/project/${projectId}` });
            if (res.success) {
                setWorkflows(res.data.data);
            }
            setLoading(false);
        }
        fetchWorkflows();
    }, [projectId]);

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
            setWorkflows(workflows.filter(wf => wf._id !== workflowId));
        } else {
            console.error("Failed to delete workflow");
        }
    };

    return (
        <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>Workflows</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Create Workflow
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead sx={{ bgcolor: "background.default" }}>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Version</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Editable</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {workflows.map((wf) => (
                            <TableRow key={wf._id}>
                                <TableCell sx={{ fontWeight: 500 }}>{wf.name}</TableCell>
                                <TableCell>V{wf.version}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={wf.isActive ? "Active" : "Draft"} 
                                        color={wf.isActive ? "success" : "default"} 
                                        size="small" 
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={wf.isEditable ? "Yes" : "Read-only"} 
                                        color={wf.isEditable ? "primary" : "error"} 
                                        size="small" 
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        onClick={() => navigate(PROJECT_ROUTES.projectWorkflowDetail(workspaceSlug, projectSlug, wf._id))}
                                        sx={{ mr: 1 }}
                                    >
                                        Open
                                    </Button>
                                    <Tooltip 
                                        title={wf.categoryIds?.length > 0 ? "already in work now.. not possible to remove it .." : "Delete Workflow"}
                                    >
                                        <span>
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                onClick={() => handleDelete(wf._id)}
                                                disabled={wf.categoryIds?.length > 0}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            )}
        </Box>
    );
}
