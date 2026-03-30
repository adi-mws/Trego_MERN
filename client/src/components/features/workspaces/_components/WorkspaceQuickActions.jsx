"use client";

import RectangularButton from "../../../../components/ui/RectangularButton";
import Add from "@mui/icons-material/Add";
import InsertLinkOutlinedIcon from "@mui/icons-material/InsertLinkOutlined";
import { Stack } from "@mui/material";

export default function WorkspaceQuickActions({ setOpenCreateDialog, setOpenJoinDialog }) {

  return (
    <>
      <Stack direction="row" spacing={2}>
        <RectangularButton
          icon={<Add sx={{ fontSize: 35, opacity: 0.8 }} />}
          text="Create Workspace"
          onClick={() => setOpenCreateDialog(true)}
        />

        <RectangularButton
          icon={
            <InsertLinkOutlinedIcon
              sx={{ fontSize: 35, opacity: 0.8, rotate: "-36deg" }}
            />
          }
          text="Join Workspace"
          onClick={() => { }}
        />
      </Stack>


    </>
  );
}