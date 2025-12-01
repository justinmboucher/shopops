// src/api/inventory.js
import client from "./client";

// List "inventory" – for now, just materials
export async function fetchInventory(params = {}) {
  // This calls: GET /api/inventory/materials/
  const response = await client.get("inventory/materials/", { params });
  return response.data;
}

export async function fetchInventoryItem(id) {
  const response = await client.get(`inventory/materials/${id}/`);
  return response.data;
}

export async function createInventoryItem(data) {
  const response = await client.post("inventory/materials/", data);
  return response.data;
}

export async function updateInventoryItem(id, data) {
  const response = await client.put(`inventory/materials/${id}/`, data);
  return response.data;
}

export async function patchInventoryItem(id, data) {
  const response = await client.patch(`inventory/materials/${id}/`, data);
  return response.data;
}

export async function deleteInventoryItem(id) {
  const response = await client.delete(`inventory/materials/${id}/`);
  return response.data;
}
