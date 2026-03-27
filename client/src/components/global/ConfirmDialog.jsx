import { useDispatch, useSelector } from "react-redux";
import { resolveConfirm } from "../../hooks/useConfirm";
import Slide from "@mui/material/Slide";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from "@mui/material";

const Transition = Slide; // slide-down animation

export default function ConfirmDialog() {
  const dispatch = useDispatch();
  const { open, title, message } = useSelector((s) => s.confirm);

  return (
    <Dialog
      open={open}
      onClose={() => resolveConfirm(false, dispatch)}
      TransitionComponent={Transition}
      transitionDuration={300}
      keepMounted
      fullWidth
      PaperProps={{
        sx: {
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          m: 0,
          borderRadius: 3,
          px: 1,
          boxShadow: 3,
        },
      }}
      // Must disable backdrop click
      hideBackdrop
      disablePortal
    >
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ opacity: 0.9 }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => resolveConfirm(false, dispatch)}>Cancel</Button>

        <Button
          onClick={() => resolveConfirm(true, dispatch)}
          color="error"
          variant="contained"
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
