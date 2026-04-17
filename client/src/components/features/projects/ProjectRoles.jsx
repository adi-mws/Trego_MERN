import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Stack, Switch, FormControlLabel,
  Divider, Chip,
} from "@mui/material";

import { Edit, Delete, Add } from "@mui/icons-material";
import { callApi } from "../../../api/api"
import { useAlert } from "../../../hooks/useAlert";
const defaultPermissions = {
  canManageProject: false,
  canManageMembers: false,
  canInviteMembers: false,
  canCreateTask: true,
  canEditTask: true,
  canDeleteTask: false,
  canViewActivity: true,
};

export default function ProjectRoles({ projectId }) {
  const alert = useAlert();

  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);

  const [form, setForm] = useState({
    name: "",
    permissions: defaultPermissions,
  });

  // 🔹 Fetch roles
  const fetchRoles = async () => {
    const res = await callApi({
      method: "get",
      url: `/projects/${projectId}/roles`,
    });

    if (res.success) {
      setRoles(res.data.roles || []);
    } else {
      alert("Failed to fetch roles", "error");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  //  Open Create
  const handleCreate = () => {
    setEditRole(null);
    setForm({
      name: "",
      permissions: defaultPermissions,
    });
    setOpen(true);
  };

  //  Open Edit
  const handleEdit = (role) => {
    setEditRole(role);
    setForm({
      name: role.name,
      permissions: role.permissions || defaultPermissions,
    });
    setOpen(true);
  };

  //  Toggle Permission
  const handlePermissionChange = (key) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  // 🔹 Save
  const handleSave = async () => {
    if (!form.name.trim()) {
      return alert("Role name is required", "warning");
    }

    let res;

    if (editRole) {
      res = await callApi({
        method: "put",
        url: `/projects/${projectId}/roles/${editRole._id}`,
        data: form,
      });
    } else {
      res = await callApi({
        method: "post",
        url: `/projects/${projectId}/roles`,
        data: form,
      });
    }

    if (res.success) {
      alert(
        editRole ? "Role updated successfully" : "Role created successfully",
        "success"
      );
      setOpen(false);
      fetchRoles();
    } else {
      alert(res.error?.message || "Operation failed", "error");
    }
  };

  //  Delete
  const handleDelete = async (roleId) => {
    const res = await callApi({
      method: "delete",
      url: `/projects/${projectId}/roles/${roleId}`,
    });

    if (res.success) {
      alert("Role deleted", "success");
      fetchRoles();
    } else {
      alert(res.error?.message || "Delete failed", "error");
    }
  };

  return (
    <Box>
      {/* 🔷 Header */}
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={600}>
          Project Roles
        </Typography>

        <Button variant="outlined" startIcon={<Add />} onClick={handleCreate}>
          Add Role
        </Button>
      </Stack>

      {/*  Table */}
      <Paper variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {roles.map((role) => (
              <TableRow key={role._id} hover>
                <TableCell>{role.name}</TableCell>

                <TableCell>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {Object.entries(role.permissions || {})
                      .filter(([_, v]) => v)
                      .map(([key]) => (
                        <Chip
                          key={key}
                          label={key.replace("can", "")}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                  </Stack>
                </TableCell>

                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(role)}>
                    <Edit fontSize="small" />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => handleDelete(role._id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {!roles.length && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No roles found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/*  Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editRole ? "Edit Role" : "Create Role"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Role Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              fullWidth
            />

            <Divider />

            <Typography fontWeight={600}>Permissions</Typography>

            <Stack>
              {Object.keys(defaultPermissions).map((key) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Switch
                      checked={form.permissions[key]}
                      onChange={() => handlePermissionChange(key)}
                    />
                  }
                  label={key.replace("can", "")}
                />
              ))}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}