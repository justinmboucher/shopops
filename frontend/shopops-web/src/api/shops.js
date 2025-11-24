// src/api/shops.js
import api from "./client";

export async function fetchCurrentShop() {
  const res = await api.get("shop/");
  return res.data;
}

// Alias for compatibility (if something still imports fetchShop)
export const fetchShop = fetchCurrentShop;

export async function createShop(payload) {
  const res = await api.post("shop/", payload);
  return res.data;
}

export async function updateShop(payload) {
  // MVP: one shop per user, so we always PUT to /shop/
  const res = await api.put("shop/", payload);
  return res.data;
}
