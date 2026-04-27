import RectangularButton from "../../../../components/ui/RectangularButton";
import Add from "@mui/icons-material/Add";
import { Stack } from "@mui/material";

export default function WorkspaceQuickActions({ setOpenCreateDialog }) {

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ width: "100%", flexWrap: "wrap" }}>
        <RectangularButton
          icon={<Add sx={{ fontSize: 35, opacity: 0.8 }} />}
          text="Create Workspace"
          onClick={() => setOpenCreateDialog(true)}
          sx={{
            width: { xs: "100%", sm: "auto" },
            minWidth: { xs: "100%", sm: 250 },
            minHeight: { xs: 112, sm: 130 },
            p: { xs: 2, sm: 3 },
          }}
        />


      </Stack>


    </>
  );
}
