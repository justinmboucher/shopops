// src/components/layout/Topbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function Topbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-logo">ShopOps</span>
      </div>

      <div className="topbar-right">
        {isAuthenticated && (
          <button
            type="button"
            className="topbar-logout"
            onClick={handleLogout}
          >
            Log out
          </button>
        )}
      </div>
    </header>
  );
}
