import { createContext, useContext, useMemo, useState } from "react";

const AgentChatContext = createContext(null);

export function AgentChatProvider({ children }) {
  const [open, setOpen] = useState(false);

  const value = useMemo(() => {
    return {
      open,
      openDrawer: () => setOpen(true),
      closeDrawer: () => setOpen(false),
      toggleDrawer: () => setOpen((current) => !current),
    };
  }, [open]);

  return (
    <AgentChatContext.Provider value={value}>
      {children}
    </AgentChatContext.Provider>
  );
}

export function useAgentChat() {
  const context = useContext(AgentChatContext);
  if (!context) {
    throw new Error("useAgentChat must be used within AgentChatProvider");
  }
  return context;
}
