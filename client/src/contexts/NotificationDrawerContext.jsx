import { createContext, useContext, useState } from "react";

const NotificationsDrawerContext = createContext();

export const NotificationsDrawerProvider = ({ children }) => {
    const [open, setOpen] = useState(false);

    const openDrawer = () => {
        setOpen(true);
    };

    const closeDrawer = () => setOpen(false);

    return (
        <NotificationsDrawerContext.Provider
            value={{
                open,
                openDrawer,
                closeDrawer,
            }}
        >
            {children}
        </NotificationsDrawerContext.Provider>
    );
};

export const useNotificationsDrawer = () => {
    const context = useContext(NotificationsDrawerContext);
    if (!context) {
        throw new Error("useNotificationsDrawer must be used within provider");
    }
    return context;
};