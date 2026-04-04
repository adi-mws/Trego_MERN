
import { useSelector, useDispatch } from "react-redux";
import { Snackbar, Alert, Slide, Box } from "@mui/material";
import { removeAlert } from "../../redux/slices/alertSlice";

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

export default function AlertContainer() {
  const alerts = useSelector((state) => state.alerts.list);
  const dispatch = useDispatch();

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {alerts.map((alert) => (
        <Snackbar
          key={alert.id}
          open
          autoHideDuration={4000}
          onClose={() => dispatch(removeAlert(alert.id))}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => dispatch(removeAlert(alert.id))}
            severity={alert.severity || "info"}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
}
