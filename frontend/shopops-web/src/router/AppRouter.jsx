// src/router/AppRouter.jsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Settings from "../pages/Settings";
import Projects from "../pages/Projects";
import Workflows from "../pages/Workflows";
import WorkflowDetail from "../pages/WorkflowDetail";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import RequireAuth from "./RequireAuth";
import ProjectDetail from "../pages/ProjectDetail";
import Customers from "../pages/Customers";
import CustomerDetail from "../pages/CustomerDetail";
import ProjectsBoard from "../pages/ProjectsBoard";

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/customers"
        element={
        <RequireAuth>
          <Customers />
        </RequireAuth>
        }
      />
      <Route
  path="/customers/:id"
  element={
    <RequireAuth>
      <CustomerDetail />
    </RequireAuth>
  }
/>
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        }
      />
      <Route
        path="/projects"
        element={
          <RequireAuth>
            <Projects />
          </RequireAuth>
        }
      />
      <Route
    path="/projects/:id"
    element={
      <RequireAuth>
        <ProjectDetail />
      </RequireAuth>
    }
  />
  <Route path="/projects/board" element={<ProjectsBoard />} />
      <Route
        path="/workflows"
        element={
          <RequireAuth>
            <Workflows />
          </RequireAuth>
        }
      />
      <Route
        path="/workflows/:id"
        element={
          <RequireAuth>
            <WorkflowDetail />
          </RequireAuth>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRouter;
