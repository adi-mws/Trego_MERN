import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Typography,
    TextField,
    Stack,
    Button,
    Switch,
    FormControlLabel,
    Chip,
    MenuItem,
} from "@mui/material";
import ColorCirclePicker from "../../../global/ColorPickerCircle";
import { updateEdge, deleteEdge } from "../../../../redux/slices/workflowSlice";
import { callApi } from "../../../../api/api";

export default function WorkflowEdgeEditor() {
    const dispatch = useDispatch();
    const { selectedEdge, isEditable } = useSelector((state) => state.workflow);
    const { _id: projectId } = useSelector((state) => state.project);

    const [label, setLabel] = useState("");
    const [action, setAction] = useState("");
    const [meta, setMeta] = useState({});
    const [requireComment, setRequireComment] = useState(false);
    const [allowedRoles, setAllowedRoles] = useState([]);
    const [projectRoles, setProjectRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);

    useEffect(() => {
        if (!selectedEdge) return;

        setLabel(selectedEdge.label || "");
        setAction(selectedEdge.data?.action || "");
        setMeta(selectedEdge.data?.meta || {});
        setRequireComment(!!selectedEdge.data?.requireComment);
        setAllowedRoles(selectedEdge.data?.allowedRoles || []);
    }, [selectedEdge]);

    useEffect(() => {
        const fetchRoles = async () => {
            setLoadingRoles(true);
            if (projectId) {
                const res = await callApi({
                    method: "get",
                    url: `/projects/${projectId}/roles`,
                });
                if (res.success) {
                    setProjectRoles(res.data.roles || []);
                } else {
                    console.error("Failed to fetch roles");
                }
            }
            setLoadingRoles(false);
        };

        fetchRoles();
    }, [projectId]);

    if (!selectedEdge) return null;

    const handleEdgeUpdate = (updates) => {
        dispatch(updateEdge({
            ...selectedEdge,
            ...updates,
        }));
    };

    return (
        <>
            <Typography variant="h6">Transition</Typography>

            <TextField
                fullWidth
                label="Label"
                disabled={!isEditable}
                value={label}
                onChange={(e) => {
                    const value = e.target.value;
                    setLabel(value);
                    handleEdgeUpdate({ label: value });
                }}
                sx={{ mt: 2 }}
            />

            <TextField
                fullWidth
                label="Action (approve / reject)"
                disabled={!isEditable}
                value={action}
                onChange={(e) => {
                    const value = e.target.value;
                    setAction(value);
                    handleEdgeUpdate({ data: { ...selectedEdge.data, action: value } });
                }}
                sx={{ mt: 2 }}
            />

            <Box sx={{ mt: 2 }}>
                <Typography variant="body2">Allowed Roles</Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, rowGap: 1 }}>
                    {allowedRoles.length === 0 && (
                        <Chip label="All Roles Allowed" color="success" variant="outlined" />
                    )}
                    {allowedRoles.map((roleId) => {
                        const role = projectRoles.find((r) => r._id === roleId);
                        return (
                            <Chip
                                key={roleId}
                                label={role?.name || roleId}
                                onDelete={isEditable ? () => {
                                    const newRoles = allowedRoles.filter((r) => r !== roleId);
                                    setAllowedRoles(newRoles);
                                    handleEdgeUpdate({ data: { ...selectedEdge.data, allowedRoles: newRoles } });
                                } : undefined}
                            />
                        );
                    })}
                </Stack>

                <TextField
                    select
                    fullWidth
                    label="Add Role"
                    disabled={!isEditable}
                    sx={{ mt: 1 }}
                    value=""
                    onChange={(e) => {
                        const value = e.target.value;
                        if (!allowedRoles.includes(value)) {
                            const newRoles = [...allowedRoles, value];
                            setAllowedRoles(newRoles);
                            handleEdgeUpdate({ data: { ...selectedEdge.data, allowedRoles: newRoles } });
                        }
                    }}
                >
                    <MenuItem disabled value="">
                        {loadingRoles ? "Loading..." : "Select Role"}
                    </MenuItem>

                    {projectRoles.map((role) => (
                        <MenuItem key={role._id} value={role._id}>
                            {role.name}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            <Box sx={{ mt: 2 }}>
                <Typography variant="body2">Transition Color</Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                    {[
                        "#21ce21", "#faad14",
                        "#722ed1", "#13c2c2",
                        "#eb2f96", "#fa541c",
                        "#2f54eb",
                    ].map((color) => (
                        <Box
                            key={color}
                            onClick={isEditable ? () => {
                                const newMeta = { ...meta, color };
                                setMeta(newMeta);
                                handleEdgeUpdate({ data: { ...selectedEdge.data, meta: newMeta } });
                            } : undefined}
                            sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                backgroundColor: color,
                                cursor: isEditable ? "pointer" : "default",
                                border:
                                    meta.color === color
                                        ? "2px solid #000"
                                        : "2px solid transparent",
                            }}
                        />
                    ))}

                    {isEditable && (
                        <ColorCirclePicker 
                            color={meta.color}
                            onChange={(color) => {
                                const newMeta = { ...meta, color };
                                setMeta(newMeta);
                                handleEdgeUpdate({ data: { ...selectedEdge.data, meta: newMeta } });
                            }} 
                        />
                    )}
                </Stack>
            </Box>

            <Box sx={{ mt: 2 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={requireComment}
                            disabled={!isEditable}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setRequireComment(checked);
                                handleEdgeUpdate({ data: { ...selectedEdge.data, requireComment: checked } });
                            }}
                        />
                    }
                    label="Require Comment"
                />
            </Box>

            <TextField
                fullWidth
                label="Color"
                disabled={!isEditable}
                value={meta.color || ""}
                onChange={(e) => {
                    const newMeta = { ...meta, color: e.target.value };
                    setMeta(newMeta);
                    handleEdgeUpdate({ data: { ...selectedEdge.data, meta: newMeta } });
                }}
                sx={{ mt: 2 }}
            />



            {isEditable && (
                <Button
                    sx={{ mt: 1 }}
                    color="error"
                    onClick={() => dispatch(deleteEdge(selectedEdge.id))}
                >
                    Delete
                </Button>
            )}
        </>
    );
}
