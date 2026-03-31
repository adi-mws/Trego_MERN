import  { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useUserGlobal } from "../hooks/useUserGlobal";
import axios from "axios";

export default function AppLayout() {
  const { setUser, setLoading, setError } = useUserGlobal();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/user/global");
        setUser(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return <Outlet />;
}