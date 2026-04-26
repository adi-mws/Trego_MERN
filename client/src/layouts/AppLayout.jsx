import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useUserGlobal } from "../hooks/useUserGlobal";
import { callApi } from "../api/api";
import LoadingPage from "../components/global/LoadingPage";
import { AccountDialogProvider } from "../contexts/AccountDialogContext";
import AccountDialog from "../components/features/account/AccountDialog";
import AppThemeProvider from "../themes/AppThemeProvider";
import { NotificationsDrawerProvider } from "../contexts/NotificationDrawerContext";
import NotificationsDrawer from "../components/features/notifications/NotificationsDrawer";
import { HeaderProvider } from "../contexts/HeaderContext";
import ConfirmDialog from "../components/global/ConfirmDialog";
import { SocketProvider } from "../contexts/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { useSocketEvent } from "../lib/socket";
import { logout as logoutAuth, updateAuthData } from "../redux/slices/authSlice";
import { AUTH_ROUTES } from "../lib/routes";

function DashboardRealtimeBridge() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { updateUser, addSession, removeSession, reset } = useUserGlobal();
    const { isAuthenticated, loading, data } = useSelector((state) => state.auth);
    const currentSessionId = data?.currentSessionId || data?.sessionId || null;
    const currentUserId = data?._id || null;

    const socketEnabled = !loading && isAuthenticated && !!currentUserId && !!currentSessionId;

    const handleUserUpdated = useCallback((payload) => {
        if (!payload?.user) return;

        if (
            payload.sourceSessionId &&
            currentSessionId &&
            String(payload.sourceSessionId) === String(currentSessionId)
        ) {
            return;
        }

        updateUser(payload.user);
        dispatch(updateAuthData(payload.user));
    }, [currentSessionId, dispatch, updateUser]);

    useSocketEvent("user:updated", handleUserUpdated, socketEnabled);

    const syncUserGlobal = useCallback(async () => {
        try {
            const res = await callApi({
                method: "GET",
                url: "/user/global",
            });

            if (res?.success && res?.data?.data) {
                const freshUser = res.data.data;
                updateUser(freshUser);
                dispatch(updateAuthData(freshUser));
            }
        } catch (err) {
            console.warn("Failed to resync user global data:", err?.message || err);
        }
    }, [dispatch, updateUser]);

    useSocketEvent("connect", syncUserGlobal, socketEnabled);
    useSocketEvent("reconnect", syncUserGlobal, socketEnabled);

    const handleSessionAdded = useCallback((payload) => {
        const session = payload?.session;
        if (!session) return;

        if (
            payload.sourceSessionId &&
            currentSessionId &&
            String(payload.sourceSessionId) === String(currentSessionId)
        ) {
            return;
        }

        addSession(session);
    }, [addSession, currentSessionId]);

    useSocketEvent("auth:session-added", handleSessionAdded, socketEnabled);

    const handleSessionRemoved = useCallback((payload) => {
        const removedIds = Array.isArray(payload?.removedSessionIds)
            ? payload.removedSessionIds.map((id) => String(id)).filter(Boolean)
            : payload?.sessionId
              ? [String(payload.sessionId)]
              : [];

        if (removedIds.length === 0) return;

        removedIds.forEach((sessionId) => removeSession(sessionId));

        if (
            currentSessionId &&
            removedIds.includes(String(currentSessionId))
        ) {
            dispatch(logoutAuth());
            reset();
            navigate(AUTH_ROUTES.signIn, { replace: true });
        }
    }, [currentSessionId, dispatch, navigate, removeSession, reset]);

    useSocketEvent("auth:session-removed", handleSessionRemoved, socketEnabled);

    return null;
}

export default function AppLayout() {
    const { setUser, setError } = useUserGlobal();
    const [bootstrapping, setBootstrapping] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setBootstrapping(true);

            try {
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
            } catch (err) {
                setError(err?.message || "Failed to load user");
            } finally {
                setBootstrapping(false);
            }
        };

        fetchUser();
    }, [setError, setUser]);

    if (bootstrapping) return <LoadingPage message="Loading Data" />
    return (
        <>
            <AppThemeProvider type='dashboard'>
                <HeaderProvider>
                    <SocketProvider>
                        <NotificationsDrawerProvider>
                            <AccountDialogProvider>
                                <DashboardRealtimeBridge />
                                <AccountDialog />
                                <ConfirmDialog />
                                <NotificationsDrawer />
                                <Outlet />
                            </AccountDialogProvider>
                        </NotificationsDrawerProvider>
                    </SocketProvider>
                </HeaderProvider>
            </AppThemeProvider>

        </>
    )
}
