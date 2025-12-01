import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-shell-main">
        <Topbar />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
