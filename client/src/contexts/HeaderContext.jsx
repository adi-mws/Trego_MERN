import { createContext, useContext, useState } from "react";

const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
  const [headerTitle, setHeaderTitle] = useState(null);
  const [headerRightActions, setHeaderRightActions] = useState(null);

  return (
    <HeaderContext.Provider
      value={{
        headerTitle,
        setHeaderTitle,
        headerRightActions,
        setHeaderRightActions,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => useContext(HeaderContext);