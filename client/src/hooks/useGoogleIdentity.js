import { useCallback, useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_ID = "google-identity-client";
let googleScriptPromise = null;
let googleCodeClient = null;

function loadGoogleScript() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google);
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.google), {
          once: true,
        });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = GOOGLE_SCRIPT_ID;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

export function useGoogleIdentity({
  clientId,
  onCredential,
  scope = "openid email profile",
}) {
  const onCredentialRef = useRef(onCredential);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!clientId) {
        if (mounted) {
          setError("Missing Google client ID");
        }
        return;
      }

      try {
        const google = await loadGoogleScript();

        if (!mounted || !google?.accounts?.oauth2) return;

        googleCodeClient = google.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope,
          ux_mode: "popup",
          callback: (response) => {
            if (response?.code) {
              onCredentialRef.current?.(response.code);
              return;
            }

            if (response?.error) {
              setError(response.error_description || response.error || "Google sign-in failed");
            }
          },
          error_callback: (err) => {
            if (!mounted) return;
            setError(err?.message || err?.type || "Google sign-in popup failed");
          },
        });

        setError("");
        setReady(true);
      } catch (err) {
        if (!mounted) return;
        setReady(false);
        setError(err?.message || "Failed to load Google Sign-In");
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [clientId]);

  const promptGoogle = useCallback(() => {
    if (!googleCodeClient) {
      setError("Google Sign-In is not ready yet");
      return false;
    }

    googleCodeClient.requestCode();

    return true;
  }, []);

  return {
    ready,
    error,
    promptGoogle,
  };
}
