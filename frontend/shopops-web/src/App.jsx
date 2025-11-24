import AppRouter from "./router/AppRouter";
import AppLayout from "./components/layout/AppLayout";

function App() {
  return (
    <AppLayout>
      <AppRouter />
    </AppLayout>
  );
}

export default App;
