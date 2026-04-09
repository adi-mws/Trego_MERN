import { createContext, useContext, useState } from "react";

const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
  const [headerTitle, setHeaderTitle] = useState(null);
  const [headerRightActions, setHeaderRightActions] = useState(null);
  const [headerLeftContent, setHeaderLeftContent] = useState(null);
  return (
    <HeaderContext.Provider
      value={{
        headerTitle,
        setHeaderTitle,
        headerRightActions,
        setHeaderRightActions,
        setHeaderLeftContent,
        headerLeftContent
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => useContext(HeaderContext);