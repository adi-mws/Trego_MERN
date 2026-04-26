import { createContext, useContext, useMemo, useState } from "react";

const MarketingAuthPromptContext = createContext(null);
const AUTO_SEEN_KEY = "trego_marketing_auth_prompt_seen";

export function MarketingAuthPromptProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openPrompt = () => {
    setOpen(true);
    localStorage.setItem(AUTO_SEEN_KEY, "1");
  };

  const closePrompt = () => {
    setOpen(false);
    localStorage.setItem(AUTO_SEEN_KEY, "1");
  };

  const value = useMemo(() => ({
    open,
    openPrompt,
    closePrompt,
    hasSeenPrompt: () => localStorage.getItem(AUTO_SEEN_KEY) === "1",
  }), [open]);

  return (
    <MarketingAuthPromptContext.Provider value={value}>
      {children}
    </MarketingAuthPromptContext.Provider>
  );
}

export function useMarketingAuthPrompt() {
  const context = useContext(MarketingAuthPromptContext);
  if (!context) {
    throw new Error("useMarketingAuthPrompt must be used within MarketingAuthPromptProvider");
  }
  return context;
}
