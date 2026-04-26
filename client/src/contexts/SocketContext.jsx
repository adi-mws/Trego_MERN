import { createContext, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { connectSocket, disconnectSocket, getSocketInstance } from "../lib/socket";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, loading, data } = useSelector((state) => state.auth);
  const currentSessionId = data?.currentSessionId || data?.sessionId || null;

  useEffect(() => {
    if (!loading && isAuthenticated && currentSessionId) {
      connectSocket();
      return undefined;
    }

    disconnectSocket();
    return undefined;
  }, [currentSessionId, isAuthenticated, loading]);

  useEffect(() => {
    const handleClose = () => {
      disconnectSocket();
    };

    window.addEventListener("beforeunload", handleClose);
    window.addEventListener("pagehide", handleClose);

    return () => {
      window.removeEventListener("beforeunload", handleClose);
      window.removeEventListener("pagehide", handleClose);
      disconnectSocket();
    };
  }, []);

  const value = useMemo(() => ({
    socket: getSocketInstance(),
  }), []);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
