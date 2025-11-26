// src/api/client.js
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000"; // adjust if needed, e.g. from env

let authStore = null;

export const setAuthStore = (store) => {
  // store is provided by AuthProvider (see below)
  authStore = store;
};

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
});

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    if (!authStore) return config;

    const { accessToken } = authStore.getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401s and refresh
let isRefreshing = false;
let queuedRequests = [];

const processQueue = (error, token = null) => {
  queuedRequests.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  queuedRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // No response or not 401 → just fail
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Avoid infinite loops
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    if (!authStore) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Wait until the current refresh finishes
      return new Promise((resolve, reject) => {
        queuedRequests.push({
          resolve: (token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const { refreshToken, setTokens, logout } = authStore;

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      // IMPORTANT: body key must be "refresh"
      const resp = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
        refresh: refreshToken,
      });

      const newAccess = resp.data.access;
      const newRefresh = resp.data.refresh ?? refreshToken;

      setTokens(newAccess, newRefresh);

      processQueue(null, newAccess);
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      if (authStore) authStore.logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;