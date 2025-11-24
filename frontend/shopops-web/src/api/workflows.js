import api from "./client";

export async function fetchWorkflows() {
  const res = await api.get("workflows/");
  return res.data;
}

export async function fetchWorkflow(id) {
  const res = await api.get(`workflows/${id}/`);
  return res.data;
}
