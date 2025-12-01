// src/api/projects.js
import client from "./client";

export async function fetchProjects(params = {}) {
  const response = await client.get("/projects/", { params });
  return response.data;
}

export async function fetchProject(projectId) {
  const response = await client.get(`/projects/${projectId}/`);
  return response.data;
}

export async function createProject(data) {
  const response = await client.post("/projects/", data);
  return response.data;
}

export async function cancelProject(projectId, data) {
  const response = await client.post(`/projects/${projectId}/cancel/`, data);
  return response.data;
}

export async function logProjectSale(projectId, data) {
  const response = await client.post(`/projects/${projectId}/log-sale/`, data);
  return response.data;
}

// Move project to a different stage
export async function moveProjectStage(projectId, stageId) {
  const response = await client.post(`/projects/${projectId}/move/`, {
    stage_id: Number(stageId),
  });
  return response.data;
}

// 🔧 New: update an existing project (partial update)
export async function updateProject(projectId, data) {
  const response = await client.patch(`/projects/${projectId}/`, data);
  return response.data;
}
