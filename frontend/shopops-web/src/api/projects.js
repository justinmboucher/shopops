// src/api/projects.js
import api from "./client";

export async function fetchProjects(params = {}) {
  const response = await api.get("projects/", { params });
  return response.data;
}

export async function createProject(payload) {
  const response = await api.post("projects/", payload);
  return response.data;
}

export async function cancelProject(projectId, payload) {
  const response = await api.post(`projects/${projectId}/cancel/`, payload);
  return response.data;
}

export async function logProjectSale(projectId, payload) {
  const response = await api.post(`projects/${projectId}/log_sale/`, payload);
  return response.data;
}

export async function moveProjectStage(projectId, stageId) {
  const response = await api.post(`projects/${projectId}/move/`, {
    stage_id: stageId,
  });
  return response.data;
}

export async function fetchProject(projectId) {
  const response = await api.get(`projects/${projectId}/`);
  return response.data;
}

// 🔹 NEW: used by ProjectDetail.jsx
export async function updateProject(projectId, payload) {
  const response = await api.patch(`projects/${projectId}/`, payload);
  return response.data;
}
