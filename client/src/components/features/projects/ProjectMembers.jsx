import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Stack,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Chip,
  Button,
} from "@mui/material";
import { getImageUrl } from "../../../utils/image.utils";
import { Delete, Edit } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { callApi } from "../../../api/api";
import { useAlert } from "../../../hooks/useAlert";
import { ProjectInviteDialog } from "./_components/ProjectInviteDialog";
import ProjectPermissionGate from "./_components/ProjectPermissionGate";

export default function ProjectMembers() {
  const alert = useAlert();

  const { _id: projectId, workspaceId } = useSelector(
    (state) => state.project
  );

  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [open, setOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");


  const fetchMembers = async () => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";

    const res = await callApi({
      method: "get",
      url: `/projects/${projectId}/members${query}`,
    });

    if (res.success) {
      setMembers(res.data.members || []);
    }
    else {
      alert("Failed to fetch members", "error");
    }
  };

  useEffect(() => {
    if (projectId) {
      const timer = window.setTimeout(() => {
        void (async () => {
          const res = await callApi({
            method: "get",
            url: `/projects/${projectId}/roles`,
          });

          if (res.success) {
            setRoles(res.data.roles || []);
          }
        })();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      const timer = window.setTimeout(() => {
        void (async () => {
          const query = search ? `?search=${encodeURIComponent(search)}` : "";

          const res = await callApi({
            method: "get",
            url: `/projects/${projectId}/members${query}`,
          });

          if (res.success) {
            setMembers(res.data.members || []);
          } else {
            alert("Failed to fetch members", "error");
          }
        })();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [alert, projectId, search])



  const filteredMembers = useMemo(() => {
    return members.filter((m) => {


      const matchesRole = roleFilter
        ? m.roles?.some((r) => r._id === roleFilter)
        : true;

      return matchesRole;
    });
  }, [members, roleFilter]);


  const handleRemove = async (memberId) => {
    const res = await callApi({
      method: "delete",
      url: `/projects/${projectId}/members/${memberId}`,
    });

    if (res.success) {
      alert("Member removed", "success");
      fetchMembers();
    } else {
      alert("Failed to remove member", "error");
    }
  };

  const handleEdit = (member) => {
    setEditMember(member);
    setOpen(true);
  };

  const handleAdd = () => {
    setEditMember(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMember(null);
  };


  return (
    <ProjectPermissionGate
      permission="canManageMembers"
      title="You do not have permission to view project members"
      message="Ask a project admin to grant member management access."
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={2} gap={1.5}>
          <Typography variant="h5" fontWeight={500}>Project Members</Typography>

          <Button variant="contained" onClick={handleAdd} sx={{ width: { xs: "100%", sm: "auto" } }}>
            Add Member
          </Button>
        </Stack>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Search by name or email"
              placeholder="Search for members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />

            <FormControl sx={{ minWidth: { xs: "100%", sm: 180 } }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r._id} value={r._id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredMembers.map((m) => (
                <TableRow key={m._id} hover>
                  {/* User */}
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar src={getImageUrl(m?.user.avatar)}>
                        {m?.user.name.slice(0, 1)}
                      </Avatar>
                      <Typography fontSize={14}>
                        {m.user?.name}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>{m.user?.email}</TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {m.roles?.map((role) => (
                        <Chip
                          key={role._id}
                          label={role.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(m)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => handleRemove(m._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {!filteredMembers.length && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <ProjectInviteDialog
          open={open}
          onClose={handleClose}
          projectId={projectId}
          workspaceId={workspaceId}
          onSuccess={fetchMembers}
          member={editMember}
          mode={editMember ? "edit" : "create"}
        />
      </Box>
    </ProjectPermissionGate>
  );
}
