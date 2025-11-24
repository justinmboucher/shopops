// src/components/layout/AppLayout.jsx
import { Link, useLocation } from "react-router-dom";

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
  const pathname = location.pathname;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background: "#ffffff", // full app background back to white
      }}
    >
      <aside
        style={{
          width: "240px",
          padding: "1.25rem",
          borderRight: "1px solid #e5e7eb",
          background: "#f9fafb", // subtle sidebar tint only
        }}
      >
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
      </aside>

      <main
        style={{
          flex: 1,
          padding: "1.5rem 2rem",
          // no background here – lets the app/body white show through
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
