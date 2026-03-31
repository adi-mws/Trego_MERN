// src/hooks/useVerifyAuth.js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { callApi } from "../api/api";
import { setAuth, setLoading, logout } from "../redux/slices/authSlice";

export default function useVerifyAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      dispatch(setLoading(true));

      try {
        const res = await callApi({ method: "GET", url: "/auth/verify" });
        console.log(res)
        if (mounted && res.success) {
          dispatch(setAuth({
            data: res.data.data, 
            isAuthenticated: true,
          }));
        }
      } catch (err) {
        if (mounted) dispatch(logout());
      }

      if (mounted) dispatch(setLoading(false));
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [dispatch]);
}
