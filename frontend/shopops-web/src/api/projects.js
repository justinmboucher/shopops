// src/api/projects.js
import client from "./client";

/**
 * List projects
 * @param {Object} params - Optional query params, e.g. { status, search }
 */
export async function fetchProjects(params = {}) {
  const response = await client.get("projects/", { params });
  return response.data;
}

export async function createProject(payload) {
  // Adjust the URL if your backend uses /api/projects/ instead of /projects/
  const response = await client.post("projects/", payload);
  return response.data;
}

/**
 * Retrieve a single project by id
 */
export async function fetchProject(projectId) {
  const response = await client.get(`projects/${projectId}/`);
  return response.data;
}

/**
 * Move a project to another stage (if you already built this endpoint)
 * payload might look like: { to_stage_id, note }
 */
export async function moveProject(projectId, payload) {
  const response = await client.post(`projects/${projectId}/move/`, payload);
  return response.data;
}

/**
 * Cancel a project (if you have this endpoint)
 * payload might look like: { reason, note }
 */
export async function cancelProject(projectId, payload) {
  const response = await client.post(`projects/${projectId}/cancel/`, payload);
  return response.data;
}

/**
 * Log a sale / completion for a project (if you have this endpoint)
 * payload might look like: { sale_price, tax, fees }
 */
export async function logProjectSale(projectId, payload) {
  const response = await client.post(`projects/${projectId}/log_sale/`, payload);
  return response.data;
}

export async function fetchProductTemplates(params = {}) {
  // Common patterns:
  // - "products/templates/" -> /api/products/templates/
  // - "products/"           -> /api/products/
  const response = await client.get("products/templates/", { params });
  return response.data;
}