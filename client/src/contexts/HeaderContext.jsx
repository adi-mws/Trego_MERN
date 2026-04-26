import { createContext, useContext, useMemo, useState } from "react";

const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
  const [headerTitle, setHeaderTitle] = useState(null);
  const [headerRightActions, setHeaderRightActions] = useState(null);
  const [headerLeftContent, setHeaderLeftContent] = useState(null);

  const value = useMemo(() => ({
    headerTitle,
    setHeaderTitle,
    headerRightActions,
    setHeaderRightActions,
    setHeaderLeftContent,
    headerLeftContent,
  }), [
    headerTitle,
    headerRightActions,
    headerLeftContent,
  ]);

  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => useContext(HeaderContext);
