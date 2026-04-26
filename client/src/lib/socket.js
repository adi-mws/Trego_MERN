import { io } from "socket.io-client";
import { useEffect } from "react";

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api\/?$/, "");

let socketInstance = null;

export function getSocketInstance() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }

  return socketInstance;
}

export function connectSocket() {
  const socket = getSocketInstance();
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket() {
  if (!socketInstance) return;
  socketInstance.disconnect();
}

export function useSocketEvent(eventName, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    const socket = getSocketInstance();
    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [enabled, eventName, handler]);
}
