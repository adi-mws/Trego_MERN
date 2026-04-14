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

  const [workspaces, setWorkspaces] = useState([]);

  const [isLoading, setIsLoading] = useState(false); // initial load
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false); // pagination
  const [isError, setIsError] = useState(false);

  const [cursor, setCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  const observerRef = useRef(null);

  /*  FETCH FUNCTION  */

  const fetchWorkspaces = async ({
    cursorValue = null,
    appliedFilters = filters,
    isNextPage = false,
  }) => {
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
console.log(data);
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
  };


  useEffect(() => {
    fetchWorkspaces({});
  }, []);

  /*  FILTER CHANGE  */

  useEffect(() => {
    setWorkspaces([]);
    setCursor(null);
    setHasNextPage(true);

    fetchWorkspaces({ appliedFilters: filters });
  }, [filters]);

  /*  FETCH NEXT PAGE  */

  const fetchNextPage = async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    await fetchWorkspaces({
      cursorValue: cursor,
      appliedFilters: filters,
      isNextPage: true,
    });
  };

  /*  INFINITE SCROLL  */

  const lastElementRef = useCallback(
    (node) => {
      if (isFetchingNextPage || isLoading) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, isLoading, hasNextPage, cursor]
  );

  /*  CREATE WORKSPACE  */

  const handleCreateWorkspace = async (workspace) => {
    console.log(workspace)
    setWorkspaces((prev) => [workspace, ...prev]);
  };

  /*  RENDER  */

  return (
    <Container
      maxWidth="lg"
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <WorkspaceQuickActions
        setOpenCreateDialog={setOpenCreateDialog}
      />

      <WorkspacesListHeader
        filters={filters}
        onFiltersChange={setFilters}
      />

      {isError && (
        <Box color="error.main">
          Failed to load workspaces.
        </Box>
      )}

      <WorkspacesList
        workspaces={workspaces}
        lastElementRef={lastElementRef}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />

      {isLoading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}

      {isFetchingNextPage && (
        <Box display="flex" justifyContent="center">
          <CircularProgress size={24} />
        </Box>
      )}

      {!hasNextPage && !isLoading && (
        <Box textAlign="center" color="text.secondary">
          No more workspaces
        </Box>
      )}

      <CreateWorkspaceDialog
        open={openCreateDialog}
        onWorkspaceCreation={handleCreateWorkspace}
        onClose={() => setOpenCreateDialog(false)}
      />
    </Container>
  );
}