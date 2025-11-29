// src/context/AuthProvider.jsx
import React, { useState, useEffect, useCallback } from "react";
import AuthContext from "./AuthContext";
import api, { setAuthStore } from "../api/client";

const ACCESS_KEY = "shopops_access";
const REFRESH_KEY = "shopops_refresh";

function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem(ACCESS_KEY) || null
  );
  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem(REFRESH_KEY) || null
  );
  const [user, setUser] = useState(null);

  // For the login form
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // For initial "am I logged in?" bootstrap
  const [initializing, setInitializing] = useState(true);

  const setTokens = useCallback((access, refresh) => {
    setAccessToken(access);
    setRefreshToken(refresh);

    if (access) {
      localStorage.setItem(ACCESS_KEY, access);
    } else {
      localStorage.removeItem(ACCESS_KEY);
    }

    if (refresh) {
      localStorage.setItem(REFRESH_KEY, refresh);
    } else {
      localStorage.removeItem(REFRESH_KEY);
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const getTokens = useCallback(
    () => ({ accessToken, refreshToken }),
    [accessToken, refreshToken]
  );

  const logout = useCallback(() => {
    setTokens(null, null);
    setUser(null);
    setAuthError(null);
  }, [setTokens]);

  const login = useCallback(
  async (username, password) => {
    clearError();
    setLoading(true);
    try {
      const resp = await api.post("/auth/token/", { username, password });
      const { access, refresh } = resp.data;

      // store tokens
      setTokens(access, refresh);

      // explicitly send Authorization header for this first /me call
      const meResp = await api.get("/auth/me/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      setUser(meResp.data);
    } catch (error) {
      let msg = "Unable to sign in. Please check your username and password.";

      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data.detail === "string") {
          msg = data.detail;
        } else if (Array.isArray(data.non_field_errors)) {
          msg = data.non_field_errors.join(" ");
        }
      }

      setAuthError(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  },
  [clearError, setTokens]
);

  // Wire this auth store into the axios client so it can refresh tokens
  useEffect(() => {
    setAuthStore({
      getTokens,
      setTokens,
      logout,
      get accessToken() {
        return accessToken;
      },
      get refreshToken() {
        return refreshToken;
      },
    });
  }, [accessToken, refreshToken, getTokens, logout, setTokens]);

  // On first load, see if we can load a user from an existing token
  useEffect(() => {
    const bootstrap = async () => {
      if (!accessToken) {
        setInitializing(false);
        return;
      }
      try {
        const resp = await api.get("/auth/me/");
        setUser(resp.data);
      } catch {
        // if this fails, the interceptor may try a refresh;
        // if that fails, it'll log out
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, [accessToken]);

  const value = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken,
    login,
    logout,
    loading,     // used by Login.jsx
    authError,   // used by Login.jsx
    clearError,  // used by Login.jsx
  };

  if (initializing) {
    // You can render a spinner here if you want
    return null;
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export default AuthProvider;
