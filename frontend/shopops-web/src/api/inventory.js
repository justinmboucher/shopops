// src/api/inventory.js
import client from "./client";

export async function fetchInventory(params = {}) {
  const response = await client.get("inventory/items/", { params });
  return response.data;
}

export async function fetchInventoryItem(id) {
  const response = await client.get(`inventory/items/${id}/`);
  return response.data;
}

export async function createInventoryItem(data) {
  const response = await client.post("inventory/items/", data);
  return response.data;
}

export async function updateInventoryItem(id, data) {
  const response = await client.put(`inventory/items/${id}/`, data);
  return response.data;
}

export async function patchInventoryItem(id, data) {
  const response = await client.patch(`inventory/items/${id}/`, data);
  return response.data;
}

export async function deleteInventoryItem(id) {
  const response = await client.delete(`inventory/items/${id}/`);
  return response.data;
}
