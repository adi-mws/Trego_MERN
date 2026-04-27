import { useState, useEffect, useRef, useCallback } from "react";
import { Container, CircularProgress, Box } from "@mui/material";
import WorkspaceQuickActions from "./_components/WorkspaceQuickActions";
import WorkspacesList from "./_components/WorkspacesList";
import WorkspacesListHeader from "./_components/WorkspaceListHeader";
import CreateWorkspaceDialog from "./_components/CreateWorkspaceDialog";
import { callApi } from "../../../api/api";

export default function WorkspaceListPage() {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [filters, setFilters] = useState({});
  const [view, setView] = useState("card");

  const [workspaces, setWorkspaces] = useState([]);

  const [isLoading, setIsLoading] = useState(false); // initial load
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false); // pagination
  const [isError, setIsError] = useState(false);

  const [cursor, setCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  const scrollRootRef = useRef(null);

  /*  FETCH FUNCTION  */

  const fetchWorkspaces = useCallback(async ({
    cursorValue = null,
    appliedFilters = filters,
    isNextPage = false,
  } = {}) => {
    try {
      if (isNextPage) {
        setIsFetchingNextPage(true);
      } else {
        setIsLoading(true);
      }

      setIsError(false);

      const response = await callApi({
        method: "get",
        url: "/workspaces/list",
        params: {
          limit: 10,
          ...(cursorValue && { cursor: cursorValue }),
          ...appliedFilters,
        },
      });

      if (!response.success) throw new Error(response.error);

      const data = response.data.data;
      setWorkspaces((prev) =>
        isNextPage ? [...prev, ...data.workspaces] : data.workspaces
      );

      setCursor(data.nextCursor);
      setHasNextPage(data.hasMore);
    } catch (err) {
      console.error("fetchWorkspaces error:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
    }
  }, [filters]);


  useEffect(() => {
    setWorkspaces([]);
    setCursor(null);
    setHasNextPage(true);

    fetchWorkspaces({});
  }, [fetchWorkspaces]);

  /*  FETCH NEXT PAGE  */

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    await fetchWorkspaces({
      cursorValue: cursor,
      isNextPage: true,
    });
  }, [cursor, fetchWorkspaces, hasNextPage, isFetchingNextPage]);

  /*  CREATE WORKSPACE  */

  const handleCreateWorkspace = async (workspace) => {
    console.log(workspace)
    setWorkspaces((prev) => [workspace, ...prev]);
  };

  /*  RENDER  */

  return (
    <Container
      maxWidth="lg"
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1.5, sm: 2 },
        py: { xs: 1.5, sm: 2 },
        px: { xs: 1.5, sm: 2 },
        overflow: "hidden",
        width: "100%",
        maxWidth: "100% !important",
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <WorkspaceQuickActions setOpenCreateDialog={setOpenCreateDialog} />
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        <WorkspacesListHeader
          filters={filters}
          onFiltersChange={setFilters}
          view={view}
          onViewChange={setView}
        />
      </Box>

      <Box
        ref={scrollRootRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          overscrollBehavior: "contain",
          pr: { xs: 0, sm: 0.5 },
        }}
      >
        {isError && (
          <Box color="error.main" sx={{ mb: 1.5 }}>
            Failed to load workspaces.
          </Box>
        )}

        <WorkspacesList
          workspaces={workspaces}
          view={view}
          scrollRootRef={scrollRootRef}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />

        {isLoading && (
          <Box display="flex" justifyContent="center" sx={{ py: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {isFetchingNextPage && (
          <Box display="flex" justifyContent="center" sx={{ py: 1 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!hasNextPage && !isLoading && (
          <Box textAlign="center" color="text.secondary" sx={{ py: 2 }}>
            No more workspaces
          </Box>
        )}
      </Box>

      <CreateWorkspaceDialog
        open={openCreateDialog}
        onWorkspaceCreation={handleCreateWorkspace}
        onClose={() => setOpenCreateDialog(false)}
      />
    </Container>
  );
}
