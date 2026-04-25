import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { PROJECT_ROUTES } from "../../../../lib/routes";

function hasPermission(project, permission) {
  const permissions = project?.permissions || {};

  if (permission === "canManageMembers") {
    return Boolean(permissions.canManageMembers || permissions.canManageProject);
  }

  if (permission === "canManageProject") {
    return Boolean(permissions.canManageProject);
  }

  if (permission === "canViewActivity") {
    return Boolean(permissions.canViewActivity);
  }

  return true;
}

export default function ProjectPermissionGate({
  permission,
  title = "You do not have permission to view this page",
  message = "Ask a project admin for access.",
  children,
}) {
  const project = useSelector((state) => state.project);
  const navigate = useNavigate();
  const { workspaceSlug, projectSlug } = useParams();

  if (!project._id) {
    return children;
  }

  if (hasPermission(project, permission)) {
    return children;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {message}
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              onClick={() => navigate(PROJECT_ROUTES.overview(workspaceSlug, projectSlug))}
            >
              Back to Overview
            </Button>
          </Box>
        </Stack>
      </Alert>
    </Box>
  );
}
