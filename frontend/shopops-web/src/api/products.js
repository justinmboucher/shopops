// src/api/products.js
import api from "./client";

/**
 * Fetch product templates for the current shop.
 * Adjust endpoint depending on your backend.
 *
 * Try first:
 *   GET /api/products/templates/
 *
 * If 404, switch to:
 *   GET /api/products/
 */
export async function fetchProductTemplates(params = {}) {
  try {
    // Try expected endpoint first
    const res = await api.get("products/templates/", { params });
    return res.data;
  } catch (err) {
    // Fallback if you haven't created templates/ endpoint yet
    if (err.response?.status === 404) {
      const res2 = await api.get("products/", { params });
      return res2.data;
    }
    throw err;
  }
}
