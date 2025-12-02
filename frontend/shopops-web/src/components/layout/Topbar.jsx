// src/components/layout/Topbar.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  Search as SearchIcon,
  Bell,
  Sun,
  Moon,
  User,
  Settings as SettingsIcon,
  LifeBuoy,
  Lock,
  LogOut,
  ChevronDown,
  Menu, 
  ArrowRightCircle,
} from "lucide-react";

function getPageTitle(pathname) {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/customers")) return "Customers";
  if (pathname.startsWith("/projects/board")) return "Project Board";
  if (pathname.startsWith("/projects")) return "Projects";
  if (pathname.startsWith("/inventory")) return "Inventory";
  if (pathname.startsWith("/workflows")) return "Workflows";
  if (pathname.startsWith("/settings")) return "Settings";
  return "ShopOps";
}

export default function Topbar({
  sidebarCollapsed,
  onToggleSidebar,
  isDark,
  onToggleTheme, }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth() || {};
  const [menuOpen, setMenuOpen] = useState(false);

  const title = getPageTitle(location.pathname);

  const userDisplayName =
    (user &&
      (
        `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
        user.name ||
        user.username ||
        user.email
      )) ||
    "ShopOps User";

  const handleLogout = () => {
    setMenuOpen(false);
    logout?.();
    navigate("/login", { replace: true });
  };

  const handleGo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setMenuOpen(false);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar__left">

  <button
    type="button"
    className="topbar__menu-toggle"
    onClick={onToggleSidebar}
    aria-label={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
  >
    {sidebarCollapsed ? (
      <ArrowRightCircle size={18} />
    ) : (
      <Menu size={18} />
    )}
  </button>

  <h1 className="topbar__title">{title}</h1>
</div>

      <div className="topbar__spacer" />

      <div className="topbar__right">
        <div className="topbar__search">
          <SearchIcon size={16} className="topbar__search-icon" />
          <input
            className="topbar__search-input"
            type="search"
            placeholder="Search customers, projects, inventory…"
          />
        </div>

        <button
          type="button"
          className="icon-button"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={2.2} />
        </button>

        <button
            type="button"
            className="icon-button"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={onToggleTheme}
        >
            {isDark ? <Sun size={20} strokeWidth={2.2} /> : <Moon size={20} strokeWidth={2.2} />}
        </button>

        {isAuthenticated && (
          <div
            className="topbar__user-wrapper"
            tabIndex={-1}
            onBlur={handleBlur}
          >
            <button
              type="button"
              className="topbar__user-trigger"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <div className="topbar__avatar" aria-hidden="true">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
              <span className="topbar__user-name">{userDisplayName}</span>
              <ChevronDown size={14} className="topbar__user-caret" />
            </button>

            {menuOpen && (
              <div className="topbar__user-menu">
                <div className="topbar__user-menu-header">Welcome!</div>

                <button
                  type="button"
                  className="topbar__user-menu-item"
                  onClick={() => handleGo("/account")}
                >
                  <span className="topbar__user-menu-item-icon">
                    <User size={16} />
                  </span>
                  <span>My Account</span>
                </button>

                <button
                  type="button"
                  className="topbar__user-menu-item"
                  onClick={() => handleGo("/settings")}
                >
                  <span className="topbar__user-menu-item-icon">
                    <SettingsIcon size={16} />
                  </span>
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  className="topbar__user-menu-item"
                  onClick={() => handleGo("/support")}
                >
                  <span className="topbar__user-menu-item-icon">
                    <LifeBuoy size={16} />
                  </span>
                  <span>Support</span>
                </button>

                <div className="topbar__user-menu-divider" />

                <button
                  type="button"
                  className="topbar__user-menu-item"
                  onClick={() => handleGo("/lock")}
                >
                  <span className="topbar__user-menu-item-icon">
                    <Lock size={16} />
                  </span>
                  <span>Lock Screen</span>
                </button>

                <button
                  type="button"
                  className="topbar__user-menu-item topbar__user-menu-item--danger"
                  onClick={handleLogout}
                >
                  <span className="topbar__user-menu-item-icon">
                    <LogOut size={16} />
                  </span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
