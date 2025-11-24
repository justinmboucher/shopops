// src/api/auth.js
import api from "./client";

export async function login(username, password) {
  const res = await api.post("token/", { username, password });
  const { access, refresh } = res.data;

  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);

  return res.data;
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}
