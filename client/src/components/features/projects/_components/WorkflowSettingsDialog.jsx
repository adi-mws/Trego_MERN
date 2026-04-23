import {
    Dialog, DialogTitle, DialogContent, IconButton,
    TextField, Typography, Divider, Box
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { setName, setDescription } from "../../../../redux/slices/workflowSlice";

export default function WorkflowSettingsDialog({ open, onClose }) {
    const dispatch = useDispatch();
    const { name, description, isEditable } = useSelector((state) => state.workflow);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, pt: 2, pb: 0 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                    Workflow Settings
                </Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            <Divider sx={{ mt: 1.5 }} />
            <DialogContent sx={{ pt: 2.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                    {isEditable
                        ? "Changes are auto-saved when you save the workflow."
                        : "This is a read-only version. You cannot edit it."}
                </Typography>

                <TextField
                    fullWidth
                    label="Workflow Name"
                    disabled={!isEditable}
                    value={name}
                    onChange={(e) => dispatch(setName(e.target.value))}
                    size="small"
                    sx={{ mb: 3 }}
                    autoFocus
                />

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    disabled={!isEditable}
                    placeholder="Add a brief description of what this workflow handles..."
                    value={description || ""}
                    onChange={(e) => dispatch(setDescription(e.target.value))}
                    size="small"
                />
            </DialogContent>
        </Dialog>
    );
}
