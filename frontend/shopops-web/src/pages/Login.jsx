import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Login() {
  const { login, loading, authError, clearError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch {
      // error already stored in context
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "360px",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.12)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>Sign in</h2>
        <p
          style={{
            marginTop: 0,
            marginBottom: "1rem",
            fontSize: "0.85rem",
            color: "#6b7280",
          }}
        >
          Use your ShopOps account credentials.
        </p>

        {authError && (
          <p style={{ color: "crimson", fontSize: "0.85rem" }}>
            {authError}
          </p>
        )}

        <div style={{ marginBottom: "0.75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              marginBottom: "0.25rem",
            }}
          >
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "0.4rem 0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontSize: "0.9rem",
            }}
          />
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              marginBottom: "0.25rem",
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.4rem 0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontSize: "0.9rem",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.45rem 0.8rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#2563eb",
            color: "#ffffff",
            fontSize: "0.9rem",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default Login;
