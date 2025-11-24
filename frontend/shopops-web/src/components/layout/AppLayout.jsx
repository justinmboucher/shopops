// src/components/layout/AppLayout.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const navLinkStyle = (active) => ({
  padding: "0.5rem 0.75rem",
  borderRadius: "0.5rem",
  textDecoration: "none",
  fontSize: "0.95rem",
  background: active ? "#e5e7eb" : "transparent",
  color: active ? "#111827" : "#374151",
});

function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const pathname = location.pathname;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background: "#ffffff",
      }}
    >
      <aside
        style={{
          width: "240px",
          padding: "1.25rem",
          borderRight: "1px solid #e5e7eb",
          background: "#f9fafb",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.25rem",
              marginBottom: "1.5rem",
              fontWeight: 600,
            }}
          >
            ShopOps
          </h1>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
            }}
          >
            <Link
              to="/"
              style={navLinkStyle(pathname === "/")}
            >
              Dashboard
            </Link>

            <Link
              to="/settings"
              style={navLinkStyle(pathname.startsWith("/settings"))}
            >
              Settings
            </Link>

            <Link
              to="/projects"
              style={navLinkStyle(pathname.startsWith("/projects"))}
            >
              Projects
            </Link>

            <Link
              to="/workflows"
              style={navLinkStyle(pathname.startsWith("/workflows"))}
            >
              Workflows
            </Link>
          </nav>
        </div>

        <div
          style={{
            marginTop: "2rem",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "0.75rem",
            fontSize: "0.8rem",
            color: "#6b7280",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
          }}
        >
          {isAuthenticated && (
            <span
              style={{
                fontSize: "0.8rem",
              }}
            >
              Logged in
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "0.3rem 0.7rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              cursor: "pointer",
              fontSize: "0.8rem",
              textAlign: "left",
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "1.5rem 2rem",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
