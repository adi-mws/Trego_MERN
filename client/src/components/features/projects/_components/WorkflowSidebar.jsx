import { Box, TextField, Typography, Button, Switch } from "@mui/material";
import { useState, useEffect } from "react";

export default function WorkflowSidebar({
  node,
  edge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
}) {
  const [label, setLabel] = useState("");
  const [requireComment, setRequireComment] = useState(false);

  useEffect(() => {
    if (node) {
      setLabel(node.data.label);
    } else if (edge) {
      setLabel(edge.label || "");
      setRequireComment(edge.data?.requireComment || false);
    }
  }, [node, edge]);

  if (!node && !edge) {
    return (
      <Box sx={{ width: 250, p: 2, borderLeft: "1px solid #ddd" }}>
        Select a node or edge
      </Box>
    );
  }

  return (
    <Box sx={{ width: 250, p: 2, borderLeft: "1px solid #ddd" }}>
      {node && (
        <>
          <Typography variant="h6">Stage</Typography>

          <TextField
            fullWidth
            label="Stage Name"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            sx={{ mt: 2 }}
          />

          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() =>
              onUpdateNode({
                ...node,
                data: { ...node.data, label },
              })
            }
          >
            Save
          </Button>

          <Button
            sx={{ mt: 1 }}
            color="error"
            onClick={() => onDeleteNode(node.id)}
          >
            Delete
          </Button>
        </>
      )}

      {edge && (
        <>
          <Typography variant="h6">Transition</Typography>

          <TextField
            fullWidth
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            sx={{ mt: 2 }}
          />

          <Box sx={{ mt: 2 }}>
            Require Comment
            <Switch
              checked={requireComment}
              onChange={(e) => setRequireComment(e.target.checked)}
            />
          </Box>

          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() =>
              onUpdateEdge({
                ...edge,
                label,
                data: { ...edge.data, requireComment },
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
      )}
    </Box>
  );
}