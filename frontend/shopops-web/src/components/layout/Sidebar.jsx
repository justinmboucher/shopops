// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Boxes,
  Package2,
  Wrench,
  ClipboardList,
  KanbanSquare,
  Settings as SettingsIcon,
  HelpCircle,
  ShoppingCart,
} from "lucide-react";

const baseLinkClass = "sidebar-link";

function linkClass({ isActive }) {
  return isActive ? `${baseLinkClass} sidebar-link--active` : baseLinkClass;
}

const navSections = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: <Home size={20} strokeWidth={2.2} /> },
      { to: "/customers", label: "Customers", icon: <Users size={20} strokeWidth={2.2} /> },
      { to: "/workflows", label: "Workflows", icon: <KanbanSquare size={20} strokeWidth={2.2} /> },
      { to: "/settings", label: "Settings", icon: <SettingsIcon size={20} strokeWidth={2.2} /> },
    ],
  },
  {
    label: "Projects",
    items: [
      {
        to: "/projects/board",
        label: "Project Board",
        icon: <ClipboardList size={20} strokeWidth={2.2} />,
      },
      {
        to: "/projects",
        label: "Project List",
        icon: <Package2 size={20} strokeWidth={2.2} />,
      },
    ],
  },
  {
    label: "Inventory",
    items: [
      {
        to: "/inventory/equipment",
        label: "Equipment",
        icon: <Wrench size={20} strokeWidth={2.2} />,
      },
      {
        to: "/inventory/materials",
        label: "Materials",
        icon: <Boxes size={20} strokeWidth={2.2} />,
      },
      {
        to: "/inventory/consumables",
        label: "Consumables",
        icon: <ShoppingCart size={20} strokeWidth={2.2} />,
      },
    ],
  },
];

export default function Sidebar({ collapsed }) {
  const sidebarClass = collapsed ? "sidebar sidebar--collapsed" : "sidebar";

  return (
    <aside className={sidebarClass}>
      {/* Logo / Brand */}
      <div className="sidebar__logo-row">
        <div className="sidebar__logo-mark">SO</div>
        <div className="sidebar__logo-text">
          <div className="sidebar__app-name">ShopOps</div>
          <div className="sidebar__app-tagline">Workshop command center</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navSections.map((section) => (
          <div key={section.label} className="sidebar__section">
            <div className="sidebar__section-title">{section.label}</div>
            <div className="sidebar__section-links">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={linkClass}
                  // 👇 only the "/projects" link gets `end`
                  end={item.to === "/projects"}
                >
                  <span className="sidebar-link__icon">{item.icon}</span>
                  <span className="sidebar-link__label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <NavLink to="/help" className={linkClass}>
          <span className="sidebar-link__icon">
            <HelpCircle size={20} strokeWidth={2.2} />
          </span>
          <span className="sidebar-link__label">Help & docs</span>
        </NavLink>
      </div>
    </aside>
  );
}
