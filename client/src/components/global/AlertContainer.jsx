// AlertContainer.jsx
import { useSelector, useDispatch } from "react-redux";
import { Alert, Slide, Box, useTheme } from "@mui/material";
import { removeAlert } from "../../redux/slices/alertSlice";

export default function AlertContainer() {
  const alerts = useSelector(state => state.alerts.list);
  const dispatch = useDispatch();
  const theme = useTheme();
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
        width: "350px",
        background: theme.palette.background.paper,
        maxWidth: "90%"
      }}
    >
      {alerts.map(alert => (
        <Slide key={alert.id} direction="left" in mountOnEnter unmountOnExit>
          <Alert
            severity={alert.severity}
            onClose={() => dispatch(removeAlert(alert.id))}
            sx={{
              boxShadow: 3,
              borderRadius: 2
            }}
          >
            {alert.message}
          </Alert>
        </Slide>
      ))}
    </Box>
  );
}
