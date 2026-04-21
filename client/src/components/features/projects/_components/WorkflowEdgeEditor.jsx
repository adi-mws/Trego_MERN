import {
    Box,
    Typography,
    TextField,
    Stack,
    Button,
    Switch,
    FormControlLabel,
} from "@mui/material";
import ColorCirclePicker from "../../../global/ColorPickerCircle";

export default function WorkflowEdgeEditor({
    edge,
    label,
    setLabel,
    action,
    setAction,
    meta,
    setMeta,
    requireComment,
    setRequireComment,
    allowedRoles,
    onUpdateEdge,
    onDeleteEdge,
}) {
    return (
        <>
            <Typography variant="h6">Transition</Typography>

            {/* Label */}
            <TextField
                fullWidth
                label="Label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                sx={{ mt: 2 }}
            />

            {/* Action */}
            <TextField
                fullWidth
                label="Action (approve / reject)"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                sx={{ mt: 2 }}
            />

            {/* Colors */}
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
                            onClick={() =>
                                setMeta((prev) => ({ ...prev, color }))
                            }
                            sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                backgroundColor: color,
                                cursor: "pointer",
                                border:
                                    meta.color === color
                                        ? "2px solid #000"
                                        : "2px solid transparent",
                            }}
                        />
                    ))}

                    {/* Custom Picker */}
                    <ColorCirclePicker setMeta={setMeta} />
                </Stack>
            </Box>

            {/* Require Comment */}
            <Box sx={{ mt: 2 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={requireComment}
                            onChange={(e) =>
                                setRequireComment(e.target.checked)
                            }
                        />
                    }
                    label="Require Comment"
                />
            </Box>

            {/* Meta Inputs */}
            <TextField
                fullWidth
                label="Color"
                value={meta.color || ""}
                onChange={(e) =>
                    setMeta((prev) => ({
                        ...prev,
                        color: e.target.value,
                    }))
                }
                sx={{ mt: 2 }}
            />

            <TextField
                fullWidth
                label="Icon"
                value={meta.icon || ""}
                onChange={(e) =>
                    setMeta((prev) => ({
                        ...prev,
                        icon: e.target.value,
                    }))
                }
                sx={{ mt: 2 }}
            />

            {/* Actions */}
            <Button
                sx={{ mt: 2 }}
                variant="contained"
                onClick={() =>
                    onUpdateEdge({
                        ...edge,
                        label,
                        data: {
                            ...edge.data,
                            action,
                            allowedRoles,
                            requireComment,
                            meta,
                        },
                    })
                }
            >
                Save
            </Button>

            <Button
                sx={{ mt: 1 }}
                color="error"
                onClick={() => onDeleteEdge(edge.id)}
            >
                Delete
            </Button>
        </>
    );
}