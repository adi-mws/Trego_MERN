import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
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
} from "@mui/material";

import { Delete } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { callApi } from "../../../api/api";
import { useAlert } from "../../../hooks/useAlert";

export default function ProjectMembers() {
  const alert = useAlert();
  const { _id: projectId } = useSelector((state) => state.project);

  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Fetch Members
  const fetchMembers = async () => {
    const res = await callApi({
      method: "get",
      url: `/projects/${projectId}/members`,
    });

    if (res.success) {
      setMembers(res.data.members || []);
    } else {
      alert("Failed to fetch members", "error");
    }
  };

  // Fetch Roles (for filter)
  const fetchRoles = async () => {
    const res = await callApi({
      method: "get",
      url: `/projects/${projectId}/roles`,
    });

    if (res.success) {
      setRoles(res.data.roles || []);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchMembers();
      fetchRoles();
    }
  }, [projectId]);

  // Filtering logic
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const name = m.user?.name?.toLowerCase() || "";
      const email = m.user?.email?.toLowerCase() || "";

      const matchesSearch =
        name.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase());

      const matchesRole = roleFilter
        ? m.role?._id === roleFilter
        : true;

      return matchesSearch && matchesRole;
    });
  }, [members, search, roleFilter]);

  // Remove Member
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

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" fontWeight={600} mb={2}>
        Project Members
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          {/* Search */}
          <TextField
            label="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />

          {/* Role Filter */}
          <FormControl sx={{ minWidth: 180 }}>
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

      {/* Table */}
      <Paper sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Member</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member._id} hover>
                {/* User */}
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar src={member.user?.pfp} />
                    <Typography fontSize={14}>
                      {member.user?.name}
                    </Typography>
                  </Stack>
                </TableCell>

                {/* Email */}
                <TableCell>
                  {member.user?.email}
                </TableCell>

                {/* Role */}
                <TableCell>
                  <Chip
                    label={member.role?.name}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>

                {/* Joined */}
                <TableCell>
                  {new Date(member.joinedAt).toLocaleDateString()}
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  <IconButton
                    color="error"
                    onClick={() => handleRemove(member._id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {!filteredMembers.length && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}