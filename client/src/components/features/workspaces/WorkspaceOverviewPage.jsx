import React, { useState } from "react";
import {
  Box,
  Grid,
  Skeleton,
  Button,
  Stack,
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
// import {AddCircleOutline} from "@mui/icons-material";
import { WorkspaceInviteDialog } from "./_components/WorkspaceInviteDialog";
import CreateProjectDialog from "../projects/_components/CreateProjectDialog";

export default function WorkspaceOverviewPage() {
  const [workspaceInviteOpen, setWorkspaceInviteOpen] = useState(false);
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);


  console.log('hi')

  return (
    <Box p={{ xs: 2, md: 3 }}>

      {/* HEADER ROW */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        {/* Title Skeleton */}
        <Skeleton variant="text" width={200} height={40} />

        {/* ACTION BUTTONS */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="outlined"

            // startIcon={<AddCircleOutlineIcon />}
            sx={{ borderRadius: 2 }}
            onClick={() => setCreateProjectDialogOpen(true)}
          >
            New Project
          </Button>

          <Button
            variant="contained"
            startIcon={<PersonAddAltIcon />}
            sx={{ borderRadius: 2 }}
            onClick={() => setWorkspaceInviteOpen(true)}
          >
            Invite Members
          </Button>
        </Stack>
      </Stack>

      {/* TOP METRICS CARDS */}
      <Grid container spacing={2} mb={3}>
        {[1, 2, 3, 4].map((_, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Skeleton width="60%" height={20} />
              <Skeleton width="40%" height={35} />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* MAIN CONTENT GRID */}
      <Grid container spacing={2}>

        {/* LEFT SECTION (Projects / Tasks) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              mb: 2,
            }}
          >
            <Skeleton width="30%" height={25} />
            {[1, 2, 3].map((_, i) => (
              <Skeleton key={i} height={40} sx={{ mt: 1 }} />
            ))}
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Skeleton width="40%" height={25} />
            {[1, 2, 3, 4].map((_, i) => (
              <Skeleton key={i} height={35} sx={{ mt: 1 }} />
            ))}
          </Box>
        </Grid>

        {/* RIGHT SIDEBAR (Members / Activity) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              mb: 2,
            }}
          >
            <Skeleton width="50%" height={25} />
            {[1, 2, 3].map((_, i) => (
              <Skeleton key={i} height={30} sx={{ mt: 1 }} />
            ))}
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Skeleton width="60%" height={25} />
            {[1, 2, 3, 4].map((_, i) => (
              <Skeleton key={i} height={30} sx={{ mt: 1 }} />
            ))}
          </Box>
        </Grid>
      </Grid>

      <WorkspaceInviteDialog
        open={workspaceInviteOpen}
        onClose={() => setWorkspaceInviteOpen(false)}
      />

      <CreateProjectDialog onClose={() => setCreateProjectDialogOpen(false)} open={createProjectDialogOpen} />
    </Box>
  );
}