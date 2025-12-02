// src/components/layout/AppLayout.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/useAuth";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useTheme } from "../../theme/useTheme";

function AppLayout({ children }) {
  useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const toggleSidebar = () =>
    setSidebarCollapsed((prevCollapsed) => !prevCollapsed);

  return (
    <div
      className={
        sidebarCollapsed
          ? "app-shell app-shell--sidebar-collapsed"
          : "app-shell"
      }
    >
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="app-shell__main">
        <Topbar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;
