import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {MemberProfilePopover} from "../../features/workspaces/_components/MembersProfilePopover"
import {
  Box,
  Avatar,
  Typography,
  Divider,
  IconButton,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getImageUrl } from "../../../utils/image.utils";

/* group members by role */
function groupMembers(members) {
  return members.reduce((acc, m) => {
    const role = m.role?.toLowerCase() || "member";
    acc[role] ??= [];
    acc[role].push(m);
    return acc;
  }, {});
}

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

export default function MembersSidebar({ onBack }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const { projectSlug } = useParams();
  const isProjectView = Boolean(projectSlug);

  const workspaceMembers = useSelector((state) => state.workspace.members);
  const currentProject = useSelector((state) => state?.project);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const handleMemberClick = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const filteredMembers = useMemo(() => {
    return (workspaceMembers || []).filter((m) =>
      m.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [workspaceMembers, search]);

  const groupedMembers = useMemo(
    () => groupMembers(filteredMembers),
    [filteredMembers]
  );

  return (
    <Box
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        transition: "width 0.25s ease",
        borderLeft: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.paper",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: 1.5,
          py: 1,
        }}
      >
        {!collapsed && (
          <Box>
            <Typography fontWeight={600} fontSize={14}>
              {isProjectView ? "Project Members" : "Workspace Members"}
            </Typography>

            {isProjectView && (
              <Typography variant="caption" color="text.secondary">
                {currentProject?.name || projectSlug}
              </Typography>
            )}
          </Box>
        )}

        <Stack direction="row" spacing={1}>
          {isProjectView && !collapsed && (
            <IconButton size="small" onClick={onBack}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          )}

          <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
            <MenuIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Divider />

      {/* SEARCH */}
      {!collapsed && (
        <Box sx={{ p: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search members"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>
      )}

      {!collapsed && <Divider />}
    
      {/* MEMBERS */}
      <Box sx={{ flex: 1, overflow: "auto", p: collapsed ? 0.5 : 1 }}>
        {Object.entries(groupedMembers).map(([role, list], index) => (
          <Box key={role}>
            {/* ROLE TITLE (only expanded) */}
            {!collapsed && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  px: 1,
                }}
              >
                {role}
              </Typography>
            )}

            <List dense>
              {list.map((m) => (
                <Tooltip
                  key={m._id}
                  title={collapsed ? m.name : ""}
                  placement="left"
                >
                  <ListItemButton
                    onClick={(e) => handleMemberClick(e, m)}
                    sx={{
                      py: 0.75,
                      px: collapsed ? 0.5 : 1,
                      borderRadius: 1.5,
                      justifyContent: collapsed ? "center" : "flex-start",
                    }}
                  >
                    {/* AVATAR ONLY */}
                    <Avatar
                      src={getImageUrl(m.avatar)}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 13,
                        mr: collapsed ? 0 : 1.5,
                      }}
                    >
                      {m.name?.[0]}
                    </Avatar>

                    {/* NAME */}
                    {!collapsed && (
                      <ListItemText
                        primary={
                          <Typography fontSize={13} fontWeight={500}>
                            {m.name}
                          </Typography>
                        }
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              ))}
            </List>

            {collapsed && index !== Object.keys(groupedMembers).length - 1 && (
              <Divider sx={{ my: 0.5 }} />
            )}
          </Box>
        ))}
      </Box>

      <MemberProfilePopover
        anchorEl={anchorEl}
        onClose={handleClose}
        memberId={selectedMember?._id}
      />
    </Box>
  );
}