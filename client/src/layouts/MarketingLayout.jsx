import MarketingHeader from '../components/marketing/_components/MarketingHeader'
import { Box } from '@mui/material'
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import AppThemeProvider from '../themes/AppThemeProvider'
import { useEffect, useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { callApi } from '../api/api';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import { useGoogleIdentity } from '../hooks/useGoogleIdentity';
import useAuth from '../hooks/useAuth';
import { APP_ROUTES } from '../lib/routes';
import { useAlert } from '../hooks/useAlert';

const AUTO_PROMPT_KEY = "trego_marketing_auth_prompt_seen";

function MarketingAutoPrompt() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const deviceInfo = useDeviceInfo();
  const { login } = useAuth();
  const showAlert = useAlert();
  const [googleBusy, setGoogleBusy] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  const handleGoogleCredential = useCallback(async (idToken) => {
    setGoogleBusy(true);

    try {
      const response = await callApi({
        method: "POST",
        url: "/auth/google",
        data: { code: idToken, deviceInfo },
      });

      if (response.success) {
        login(response.data?.data || response.data);
        showAlert(response.data?.message || "Signed in with Google", "success");
        navigate(APP_ROUTES.root);
      }
    } finally {
      setGoogleBusy(false);
    }
  }, [deviceInfo, login, navigate, showAlert]);

  const { ready, promptGoogle } = useGoogleIdentity({
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    onCredential: handleGoogleCredential,
  });

  useEffect(() => {
    if (isAuthenticated || loading) return undefined;

    const pathname = location.pathname || "";
    const isMarketingPage = ["/", "/pricing"].includes(pathname);

    if (!isMarketingPage || localStorage.getItem(AUTO_PROMPT_KEY) === "1" || hasPrompted) return undefined;

    let timer = null;
    let triggered = false;

    const schedulePrompt = () => {
      if (triggered || !ready || googleBusy) return;

      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
      const enoughScroll = progress >= 0.28 || window.scrollY > 220;

      if (!enoughScroll) return;

      timer = window.setTimeout(() => {
        if (triggered) return;
        triggered = true;
        setHasPrompted(true);
        localStorage.setItem(AUTO_PROMPT_KEY, "1");
        promptGoogle();
      }, 9000);
    };

    const cancelPrompt = () => {
      if (timer) window.clearTimeout(timer);
      timer = null;
    };

    const onScroll = () => {
      cancelPrompt();
      schedulePrompt();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    schedulePrompt();

    return () => {
      cancelPrompt();
      window.removeEventListener("scroll", onScroll);
    };
  }, [googleBusy, hasPrompted, isAuthenticated, loading, location.pathname, promptGoogle, ready]);

  return null;
}

export default function MarketingLayout() {
  const location = useLocation();
  const pathname = location.pathname || "";
  const isMarketingPage = ["/", "/pricing"].includes(pathname);

  return (
    <AppThemeProvider type="marketing">
      <Box>
        <MarketingHeader />
        {isMarketingPage && <MarketingAutoPrompt />}
        <Outlet />
      </Box>
    </AppThemeProvider>
  )
}
