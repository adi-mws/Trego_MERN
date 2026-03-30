import { useState } from "react";
import { Container, CircularProgress, Box } from "@mui/material";
import WorkspaceQuickActions from "./_components/WorkspaceQuickActions";
import WorkspacesList from "./_components/WorkspacesList";
import WorkspacesListHeader from "./_components/WorkspacesList";
import CreateWorkspaceDialog from "./_components/CreateWorkspaceDialog";


export default function WorkspacesView() {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [filters, setFilters] = useState({})
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const workspaces = [];

  const handleCreateWorkspace = async (
    data,
    file
  ) => {
    return await mutateAsync({ data, file });
  };

  return (
    <Container maxWidth="lg" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <WorkspaceQuickActions setOpenCreateDialog={setOpenCreateDialog} />
      <WorkspacesListHeader filters={filters} onFiltersChange={setFilters} />

      {loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Box color="error.main">
          Failed to load workspaces.
        </Box>
      )}

      {!loading && !isError && (

        <WorkspacesList
          workspaces={workspaces}
          // fetchNextPage={fetchNextPage}
          // hasNextPage={hasNextPage}
          // isFetchingNextPage={isFetchingNextPage}
        />
      )}

      <CreateWorkspaceDialog
        open={openCreateDialog}
        onWorkspaceCreation={handleCreateWorkspace}
        onClose={() => setOpenCreateDialog(false)}
      />
    </Container>
  );
}