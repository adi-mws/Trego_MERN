import "./App.css";
import AppRoutes from "./AppRoutes.jsx";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import store from "./redux/store";

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        {/* Global Components (should be shown in all of the components) */}
        <AppRoutes />
      </GoogleOAuthProvider>
    </Provider>
  )
}

export default App;
