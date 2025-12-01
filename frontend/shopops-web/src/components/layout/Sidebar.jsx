// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const baseLinkClass = "sidebar-link";

function linkClass({ isActive }) {
  return isActive ? `${baseLinkClass} active` : baseLinkClass;
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {/* Overview */}
        <div className="sidebar-section">
          <div className="sidebar-group-title">Overview</div>
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/customers" className={linkClass}>
            Customers
          </NavLink>
          <NavLink to="/workflows" className={linkClass}>
            Workflows
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            Settings
          </NavLink>
        </div>

        {/* Products */}
        <div className="sidebar-section">
          <div className="sidebar-group-title">Products</div>
          <NavLink to="/projects/board" className={linkClass}>
            Projects Board
          </NavLink>
          <NavLink to="/projects" end className={linkClass}>
            Projects List
          </NavLink>
        </div>

        {/* Inventory */}
        <div className="sidebar-section">
          <div className="sidebar-group-title">Inventory</div>
          <NavLink to="/inventory/equipment" className={linkClass}>
            Equipment
          </NavLink>
          <NavLink to="/inventory/materials" className={linkClass}>
            Materials
          </NavLink>
          <NavLink to="/inventory/consumables" className={linkClass}>
            Consumables
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}
