import AppRouter from "./router/AppRouter";
import AppLayout from "./components/layout/AppLayout";
import "./styles/theme.css";
import "./index.css";

function App() {
  return (
    <AppLayout>
      <AppRouter />
    </AppLayout>
  );
}

export default App;
