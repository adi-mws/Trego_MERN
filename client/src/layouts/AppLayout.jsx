import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useUserGlobal } from "../hooks/useUserGlobal";
import { callApi } from "../api/api";
import LoadingPage from "../components/global/LoadingPage";
import { AccountDialogProvider } from "../contexts/AccountDialogContext";
import AccountDialog from "../components/features/account/AccountDialog";
import AppThemeProvider from "../themes/AppThemeProvider";

export default function AppLayout() {
    const { setUser, setLoading, loading, setError } = useUserGlobal();

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            const res = await callApi({
                method: "GET",
                url: "/user/global"
            })
            if (res.success) {
                console.log(res.data)
                setUser(res.data.data);
            } else {
                setError(res?.error?.message || "Failed to load user");
            }
            setLoading(false);
        };

        fetchUser();
    }, []);
    if (loading) return <LoadingPage message="Loading Data" />
    return (
        <>
            <AppThemeProvider type='dashboard'>

                <AccountDialogProvider>
                    <AccountDialog />

                    <Outlet />;
                </AccountDialogProvider>
                </AppThemeProvider>

                </>
                )
}