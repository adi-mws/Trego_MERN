// useConfirm.js
import { useDispatch } from "react-redux";
import { showConfirm, hideConfirm } from "../redux/slices/confirmSlice";

let resolver = null; // <-- Lives outside Redux

export function useConfirm() {
  const dispatch = useDispatch();

  return ({ title, message }) => {
    return new Promise((resolve) => {
      resolver = resolve; // store resolve safely
      dispatch(showConfirm({ title, message }));
    });
  };
}

export function resolveConfirm(value, dispatch) {
  if (resolver) {
    resolver(value);
    resolver = null;
  }
  dispatch(hideConfirm());
}
