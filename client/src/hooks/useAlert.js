// useAlert.js
import { useDispatch } from "react-redux";
import { showAlert, removeAlert } from "../redux/slices/alertSlice";
import { useCallback } from "react";

export function useAlert() {
  const dispatch = useDispatch();

  const trigger = useCallback((message, severity = "info", timeout = 3000) => {
    const id = Date.now() + Math.random();

    dispatch(
      showAlert({
        id,
        message,
        severity,
        timeout
      })
    );

    setTimeout(() => {
      dispatch(removeAlert(id));
    }, timeout);
  }, []);

  return trigger;
}
