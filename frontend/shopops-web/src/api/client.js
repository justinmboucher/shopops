// src/api/client.js
import axios from "axios";

function isLikelyJwt(token) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (isLikelyJwt(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // If something weird is in there, clear it so it stops breaking everything
      if (token) {
        localStorage.removeItem("access");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
