// src/router/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
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
import ProjectCreate from "../pages/ProjectCreate";
import Inventory from "../pages/Inventory";

function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Redirect root "/" -> "/dashboard" */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      {/* Customers */}
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

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        }
      />

      {/* Projects */}
      <Route
        path="/projects"
        element={
          <RequireAuth>
            <Projects />
          </RequireAuth>
        }
      />
      <Route
        path="/projects/new"
        element={
          <RequireAuth>
            <ProjectCreate />
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
      <Route
        path="/projects/board"
        element={
          <RequireAuth>
            <ProjectsBoard />
          </RequireAuth>
        }
      />

      {/* Workflows */}
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

      {/* Inventory */}
      <Route
        path="/inventory/materials"
        element={
          <RequireAuth>
            <Inventory />
          </RequireAuth>
        }
      />
      <Route
        path="/inventory/consumables"
        element={
          <RequireAuth>
            <Inventory />
          </RequireAuth>
        }
      />
      <Route
        path="/inventory/equipment"
        element={
          <RequireAuth>
            <Inventory />
          </RequireAuth>
        }
      />
      <Route
        path="/inventory"
        element={
          <RequireAuth>
            <Inventory />
          </RequireAuth>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRouter;
