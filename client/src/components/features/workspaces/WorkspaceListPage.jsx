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
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);

  /*  FETCH WORKSPACES  */

  const fetchWorkspaces = async (
    cursorValue = null,
    appliedFilters = filters
  ) => {
    if (loading) return;

    try {
      setLoading(true);
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

      console.log(response.data)

      if (!response.success) {
        throw new Error(response.error);
      }

      const data = response.data;

      setWorkspaces((prev) =>
        cursorValue ? [...prev, ...data.data] : data.data
      );

      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("fetchWorkspaces error:", err);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  /*  INITIAL LOAD  */

  useEffect(() => {
    fetchWorkspaces(null, filters);
  }, []);

  /*  FILTER CHANGE  */

  useEffect(() => {
    // reset state when filters change
    setWorkspaces([]);
    setCursor(null);
    setHasMore(true);

    fetchWorkspaces(null, filters);
  }, [filters]);

  /*  INFINITE SCROLL  */

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchWorkspaces(cursor, filters);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, cursor, filters]
  );

  /*  CREATE WORKSPACE  */

  const handleCreateWorkspace = async (data, file) => {
    try {
      const response = await callApi({
        method: "post",
        url: "/workspaces",
        data,
      });

      if (!response.success) throw new Error(response.error);

      const newWorkspace = response.data.workspace;

      // prepend new workspace
      setWorkspaces((prev) => [newWorkspace, ...prev]);

      return newWorkspace;
    } catch (err) {
      console.error("createWorkspace error:", err);
      throw err;
    }
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
      />

      {loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}

      {!hasMore && !loading && (
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