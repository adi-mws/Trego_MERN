import { useEffect, useState } from "react";
import { Box, Drawer, useMediaQuery, useTheme } from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { Outlet } from 'react-router-dom'
import { useDispatch } from "react-redux";
import WorkspacesSidebar from '../components/dashboard/_components/WorkspacesSidebar'
import Header from '../components/dashboard/_components/Header'
import { clearWorkspace } from "../redux/slices/workspaceSlice";
import { useHeader } from "../contexts/HeaderContext";


export default function WorkspacesLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { setHeaderTitle, setHeaderLeftContent, setHeaderRightActions } = useHeader();

  useEffect(() => {
    dispatch(clearWorkspace());
    setHeaderTitle("Your Workspaces");
    setHeaderLeftContent(null);
    setHeaderRightActions(null);
  }, [dispatch, setHeaderLeftContent, setHeaderRightActions, setHeaderTitle]);

  return (
    <Box
      sx={{
        height: "100dvh",
        minHeight: "100dvh",
        display: "flex",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          borderRight: "1px solid",
          borderColor: "divider",
          minWidth: 0,
          flexShrink: 0,
          height: "100%",
        }}
      >
        <WorkspacesSidebar />
      </Box>

      <Drawer
        open={!isDesktop && mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 280,
            maxWidth: "100vw",
          },
        }}
      >
        <WorkspacesSidebar onNavigate={() => setMobileSidebarOpen(false)} />
      </Drawer>

      <Box
        sx={{
          minWidth: 0,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Header
          onMenuClick={() => setMobileSidebarOpen(true)}
          menuIcon={<MenuOutlinedIcon />}
          showWorkspaceTools={false}
        />
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
