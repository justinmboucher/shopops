// src/api/customers.js
import client from "./client";

// List customers (optionally you can pass filters later)
export async function fetchCustomers() {
  const response = await client.get("core/customers/");
  return response.data;
}

// Get a single customer by id (for a future detail page)
export async function fetchCustomer(id) {
  const response = await client.get(`core/customers/${id}/`);
  return response.data;
}

// Create a new customer
export async function createCustomer(payload) {
  const response = await client.post("core/customers/", payload);
  return response.data;
}

// Update an existing customer
export async function updateCustomer(id, payload) {
  const response = await client.patch(`core/customers/${id}/`, payload);
  return response.data;
}

// Optional: soft-delete later by flipping is_active on backend;
// for now, you can just call updateCustomer with { is_active: false }.