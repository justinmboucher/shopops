// src/api/inventory.js
import client from "./client";

// ----- Materials -----

export async function fetchMaterials(params = {}) {
  // GET /api/inventory/materials/
  const response = await client.get("inventory/materials/", { params });
  return response.data;
}

export async function fetchMaterial(id) {
  const response = await client.get(`inventory/materials/${id}/`);
  return response.data;
}

export async function createMaterial(data) {
  const response = await client.post("inventory/materials/", data);
  return response.data;
}

export async function updateMaterial(id, data) {
  const response = await client.put(`inventory/materials/${id}/`, data);
  return response.data;
}

export async function patchMaterial(id, data) {
  const response = await client.patch(`inventory/materials/${id}/`, data);
  return response.data;
}

export async function deleteMaterial(id) {
  const response = await client.delete(`inventory/materials/${id}/`);
  return response.data;
}

// ----- Consumables -----

export async function fetchConsumables(params = {}) {
  const response = await client.get("inventory/consumables/", { params });
  return response.data;
}

export async function fetchConsumable(id) {
  const response = await client.get(`inventory/consumables/${id}/`);
  return response.data;
}

export async function createConsumable(data) {
  const response = await client.post("inventory/consumables/", data);
  return response.data;
}

export async function updateConsumable(id, data) {
  const response = await client.put(`inventory/consumables/${id}/`, data);
  return response.data;
}

export async function patchConsumable(id, data) {
  const response = await client.patch(`inventory/consumables/${id}/`, data);
  return response.data;
}

export async function deleteConsumable(id) {
  const response = await client.delete(`inventory/consumables/${id}/`);
  return response.data;
}

// ----- Equipment -----

export async function fetchEquipment(params = {}) {
  const response = await client.get("inventory/equipment/", { params });
  return response.data;
}

export async function fetchEquipmentItem(id) {
  const response = await client.get(`inventory/equipment/${id}/`);
  return response.data;
}

export async function createEquipmentItem(data) {
  const response = await client.post("inventory/equipment/", data);
  return response.data;
}

export async function updateEquipmentItem(id, data) {
  const response = await client.put(`inventory/equipment/${id}/`, data);
  return response.data;
}

export async function patchEquipmentItem(id, data) {
  const response = await client.patch(`inventory/equipment/${id}/`, data);
  return response.data;
}

export async function deleteEquipmentItem(id) {
  const response = await client.delete(`inventory/equipment/${id}/`);
  return response.data;
}

// ----- Aggregated inventory (for dashboard, etc.) -----

export async function fetchInventory(params = {}) {
  // You can pass search/pagination params and they'll be reused
  const [materials, consumables, equipment] = await Promise.all([
    fetchMaterials(params),
    fetchConsumables(params),
    fetchEquipment(params),
  ]);

  return [
    ...materials.map((m) => ({ ...m, inventoryType: "material" })),
    ...consumables.map((c) => ({ ...c, inventoryType: "consumable" })),
    ...equipment.map((e) => ({ ...e, inventoryType: "equipment" })),
  ];
}