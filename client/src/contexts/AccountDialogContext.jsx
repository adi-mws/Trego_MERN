// context/AccountDialogContext.jsx
import { createContext, useContext, useState } from "react";

const AccountDialogContext = createContext(null);

export const AccountDialogProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("profile");
  // Open dialog
  const openDialog = (selection) => {
    setActive(selection || "profile");
    setOpen(true);
  }

    // Close dialog
    const closeDialog = () => {
      setActive("profile");
      setOpen(false)
    };

    // Toggle dialog
    const toggleDialog = () => {
      setActive("profile");
      setOpen((prev) => !prev);
    };

    return (
      <AccountDialogContext.Provider
        value={{
          open,
          openDialog,
          closeDialog,
          active,
          setActive,
          toggleDialog,
        }}
      >
        {children}
      </AccountDialogContext.Provider>
    );
  };

  export const useAccountDialog = () => {
    const context = useContext(AccountDialogContext);

    if (!context) {
      throw new Error(
        "useAccountDialog must be used within AccountDialogProvider"
      );
    }

    return context;
  };