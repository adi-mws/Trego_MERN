import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { callApi } from "../../../../api/api";
import { useAlert } from "../../../../hooks/useAlert";
import { useSelector } from "react-redux";

export function ProjectInviteDialog({
  open,
  onClose,
  projectId,
  onSuccess,
  member, 
  mode = "create", 
}) {
  const alert = useAlert();
  const { _id: workspaceId } = useSelector((state) => state.workspace);

  const [roles, setRoles] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      userId: "",
      roleIds: [],
    },
  });

  const selectedRoles = watch("roleIds");

  /* ---------------- FETCH ---------------- */
  const fetchData = async () => {
    try {
      setLoading(true);

      const [rolesRes, membersRes] = await Promise.all([
        callApi({
          method: "get",
          url: `/projects/${projectId}/roles`,
        }),
        callApi({
          method: "get",
          url: `/workspaces/${workspaceId}/members-list`,
        }),
      ]);

      if (rolesRes.success) {
        setRoles(rolesRes.data.roles || []);
      }

      if (membersRes.success) {
        setWorkspaceMembers(membersRes.data.members || []);
      }
    } catch (err) {
      alert("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && projectId && workspaceId) {
      fetchData();
    }
  }, [open, projectId, workspaceId]);

  /* ---------------- PREFILL (EDIT) ---------------- */
  useEffect(() => {
    if (member && mode === "edit") {
      setValue("userId", member.user?._id);
      setValue(
        "roleIds",
        member.roles?.map((r) => r._id) || []
      );
    } else {
      reset();
    }
  }, [member, mode]);

  /* ---------------- ROLE TOGGLE ---------------- */
  const toggleRole = (roleId) => {
    const current = selectedRoles || [];

    if (current.includes(roleId)) {
      setValue(
        "roleIds",
        current.filter((r) => r !== roleId)
      );
    } else {
      setValue("roleIds", [...current, roleId]);
    }
  };

  /* ---------------- CLOSE ---------------- */
  const handleClose = () => {
    reset();
    onClose();
  };

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (data) => {
    try {
      const url =
        mode === "edit"
          ? `/projects/${projectId}/members/${member._id}/roles`
          : `/projects/${projectId}/members`;

      const method = mode === "edit" ? "put" : "post";

      const payload =
        mode === "edit"
          ? { roleIds: data.roleIds }
          : {
              userId: data.userId,
              roleIds: data.roleIds,
            };

      const res = await callApi({
        method,
        url,
        data: payload,
      });

      if (res.success) {
        alert(
          mode === "edit"
            ? "Roles updated"
            : "Member added",
          "success"
        );
        onSuccess();
        handleClose();
      } else {
        alert(res.error?.message || "Failed", "error");
      }
    } catch (err) {
      alert("Something went wrong", "error");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {mode === "edit" ? "Edit member roles" : "Add member to project"}
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 120,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2} mt={1}>
              <Typography variant="body2" color="text.secondary">
                {mode === "edit"
                  ? "Update roles for this member"
                  : "Choose a workspace member and assign roles."}
              </Typography>

              {/* MEMBER SELECT */}
              <Controller
                name="userId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    select
                    size="small"
                    label="Workspace member"
                    {...field}
                    disabled={mode === "edit"} // 🔥 important
                    SelectProps={{ native: true }}
                    fullWidth
                  >
                    <option value="" disabled>
                      Select a member
                    </option>
                    {workspaceMembers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </TextField>
                )}
              />

              {/* ROLES */}
              <Box>
                <Typography variant="caption" fontWeight={600}>
                  Project roles
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.75,
                    mt: 1,
                  }}
                >
                  {roles.map((role) => {
                    const selected = selectedRoles?.includes(role._id);

                    return (
                      <Chip
                        key={role._id}
                        label={role.name}
                        clickable
                        size="small"
                        color={selected ? "primary" : "default"}
                        variant={selected ? "filled" : "outlined"}
                        onClick={() => toggleRole(role._id)}
                      />
                    );
                  })}
                </Box>
              </Box>
            </Stack>

            <DialogActions sx={{ mt: 2 }}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  (mode === "create" && !watch("userId")) ||
                  !selectedRoles ||
                  selectedRoles.length === 0
                }
              >
                {mode === "edit" ? "Update Roles" : "Add to Project"}
              </Button>
            </DialogActions>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}