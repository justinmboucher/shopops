// src/context/AuthProvider.jsx
import { useState } from "react";
import AuthContext from "./AuthContext";
import { login as apiLogin, logout as apiLogout } from "../api/auth";

function isLikelyJwt(token) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => {
    const stored = localStorage.getItem("access");
    return isLikelyJwt(stored) ? stored : null;
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const isAuthenticated = !!accessToken;

  async function login(username, password) {
    setLoading(true);
    setAuthError(null);
    try {
      const { access, refresh } = await apiLogin(username, password);
      // Only store if they look like JWTs
      if (isLikelyJwt(access)) {
        localStorage.setItem("access", access);
      }
      if (isLikelyJwt(refresh)) {
        localStorage.setItem("refresh", refresh);
      }
      setAccessToken(access);
      return { access, refresh };
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Invalid credentials";
      setAuthError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    apiLogout();
    setAccessToken(null);
  }

  const value = {
    isAuthenticated,
    accessToken,
    login,
    logout,
    loading,
    authError,
    clearError: () => setAuthError(null),
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export default AuthProvider;
