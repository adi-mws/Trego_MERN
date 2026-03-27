import "./App.css";
import AppRoutes from "./AppRoutes.jsx";
import { Provider } from "react-redux";
import store from "./redux/store";

function App() {

  return (
    <Provider store={store}>
      {/* Global Components (should be shown in all of the components) */}
      <AppRoutes />
    </Provider>
  );
}

export default App;
