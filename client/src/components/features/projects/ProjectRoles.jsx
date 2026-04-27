import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  TextField,
} from "@mui/material";

import { Edit, Delete, Add } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { callApi } from "../../../api/api";
import { useAlert } from "../../../hooks/useAlert";
import { useSelector } from "react-redux";
import ProjectPermissionGate from "./_components/ProjectPermissionGate";

const defaultPermissions = {
  canManageProject: false,
  canManageMembers: false,
  canInviteMembers: false,
  canCreateTask: true,
  canEditTask: true,
  canDeleteTask: false,
  canViewActivity: true,
};

const SYSTEM_ROLE_NAMES = new Set(["Head Management", "Project Manager", "Project Client"]);

export default function ProjectRoles() {
  const alert = useAlert();
  const { _id, isLoading } = useSelector((state) => state.project);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      permissions: defaultPermissions,
    },
  });

  //  Fetch roles
  const fetchRoles = useCallback(async () => {
    const res = await callApi({
      method: "get",
      url: `/projects/${_id}/roles`,
    });

    if (res.success) {
      setRoles(res.data.roles || []);
    } else {
      alert("Failed to fetch roles", "error");
    }
  }, [alert, _id]);

  useEffect(() => {
    if (_id) {
      const timer = window.setTimeout(() => {
        void fetchRoles();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [fetchRoles, _id]);

  const handleCreate = () => {
    setEditRole(null);
    reset({
      name: "",
      permissions: defaultPermissions,
    });
    setOpen(true);
  };

  const handleEdit = (role) => {
    setEditRole(role);
    reset({
      name: role.name,
      permissions: role.permissions || defaultPermissions,
    });
    setOpen(true);
  };

  const onSubmit = async (data) => {
    if (!data.name.trim()) {
      return alert("Role name is required", "warning");
    }

    let res;

    if (editRole) {
      res = await callApi({
        method: "put",
        url: `/projects/${_id}/roles/${editRole._id}`,
        data,
      });
    } else {
      console.log("Value of the project id", _id)
      res = await callApi({
        method: "post",
        url: `/projects/${_id}/roles`,
        data,
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

  const handleDelete = async (roleId) => {
    const res = await callApi({
      method: "delete",
      url: `/projects/${_id}/roles/${roleId}`,
    });

    if (res.success) {
      alert("Role deleted", "success");
      fetchRoles();
    } else {
      alert(res.error?.message || "Delete failed", "error");
    }
  };

  if (!_id || isLoading) {
    return null;
  }

  return (
    <ProjectPermissionGate
      permission="canManageProject"
      title="You do not have permission to manage project roles"
      message="Ask a project admin to update role permissions."
    >
    <Box>
      {/*  Header */}
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={500}>
          Project Roles
        </Typography>

        <Button variant="outlined" startIcon={<Add />} onClick={handleCreate}>
          Add Role
        </Button>
      </Stack>

      {/*  Table */}
      <Paper sx={{ borderRadius: 3, boxShadow: 'none' }}>
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
                      .filter(([, v]) => v)
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
                  <IconButton onClick={() => handleEdit(role)} disabled={SYSTEM_ROLE_NAMES.has(role.name)}>
                    <Edit fontSize="small" />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => handleDelete(role._id)}
                    disabled={SYSTEM_ROLE_NAMES.has(role.name)}
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
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editRole ? "Edit Role" : "Create Role"}
        </DialogTitle>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <DialogContent>
            <Stack spacing={2} mt={1}>
              {/* Role Name */}
              <Controller
                name="name"
                control={control}
                rules={{ required: "Role name is required" }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Role Name"
                    fullWidth
                    autoFocus
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Divider />

              <Typography fontWeight={600}>
                Permissions
              </Typography>

              <Stack>
                {Object.keys(defaultPermissions).map((key) => (
                  <Controller
                    key={key}
                    name={`permissions.${key}`}
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value || false}
                            onChange={(e) =>
                              field.onChange(e.target.checked)
                            }
                          />
                        }
                        label={key.replace("can", "")}
                      />
                    )}
                  />
                ))}
              </Stack>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button variant="contained" type="submit">
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
    </ProjectPermissionGate>
  );
}
