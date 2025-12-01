// src/pages/ProjectBoard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjects, moveProjectStage } from "../api/projects";
import { fetchWorkflows } from "../api/workflows";

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function formatMoney(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return `$${Number(amount).toFixed(2)}`;
}

// Rush logic: due within 3 days (including overdue)
function isRush(project) {
  if (!project?.due_date) return false;
  const due = new Date(project.due_date);
  if (Number.isNaN(due.getTime())) return false;

  const now = new Date();
  const msDiff = due.getTime() - now.getTime();
  const daysDiff = msDiff / (1000 * 60 * 60 * 24);

  return daysDiff <= 3;
}

/** Move Stage Modal with workflow search + stage names */
function MoveStageModal({ project, onClose, onUpdated }) {
  const [workflows, setWorkflows] = useState([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);
  const [workflowsError, setWorkflowsError] = useState(null);

  const [workflowSearch, setWorkflowSearch] = useState("");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [stageId, setStageId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const errorText = (field) =>
    Array.isArray(fieldErrors[field]) ? fieldErrors[field].join(" ") : null;

  const getProjectWorkflowId = (p) =>
    p?.workflow || p?.workflow_id || p?.workflowId || null;

  const getProjectStageId = (p) =>
    p?.current_stage || p?.current_stage_id || p?.stage || null;

  // Load workflows whenever modal is tied to a project
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!project) {
        setWorkflows([]);
        setSelectedWorkflowId("");
        setStageId("");
        setError(null);
        setFieldErrors({});
        return;
      }

      setLoadingWorkflows(true);
      setWorkflowsError(null);

      try {
        const data = await fetchWorkflows();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];

        if (cancelled) return;

        setWorkflows(items);
      } catch (err) {
        console.error("fetchWorkflows error:", err);
        if (!cancelled) {
          setWorkflowsError("Failed to load workflows.");
        }
      } finally {
        if (!cancelled) setLoadingWorkflows(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [project]);

  // When workflows or project change, try to preselect workflow + stage
  useEffect(() => {
    if (!project || workflows.length === 0) {
      setSelectedWorkflowId("");
      setStageId("");
      return;
    }

    const workflowIdFromProj = getProjectWorkflowId(project);

    let wf =
      (workflowIdFromProj &&
        workflows.find((w) => w.id === Number(workflowIdFromProj))) ||
      null;

    if (!wf && project.workflow_name) {
      wf = workflows.find((w) => w.name === project.workflow_name) || null;
    }

    if (!wf) {
      setSelectedWorkflowId("");
      setStageId("");
      return;
    }

    setSelectedWorkflowId(String(wf.id));

    const stages =
      wf.stages ||
      wf.stage_set ||
      wf.workflow_stages ||
      wf.stage_list ||
      [];

    let initialStageId = "";

    if (project.current_stage_name) {
      const byName = stages.find(
        (s) => s.name === project.current_stage_name
      );
      if (byName) {
        initialStageId = String(byName.id);
      }
    }

    if (!initialStageId) {
      const rawStageId = getProjectStageId(project);
      if (rawStageId != null) {
        const numeric = Number(rawStageId);
        if (!Number.isNaN(numeric)) {
          const byId = stages.find((s) => s.id === numeric);
          if (byId) {
            initialStageId = String(byId.id);
          }
        }
      }
    }

    setStageId(initialStageId || "");
  }, [project, workflows]);

  // ---- derived data (no hooks below this line) ----
  const term = workflowSearch.trim().toLowerCase();
  const filteredWorkflows = term
    ? workflows.filter((wf) =>
        [wf.name, wf.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      )
    : workflows;

  const selectedWorkflow = workflows.find(
    (w) => w.id === Number(selectedWorkflowId)
  );

  const stagesForSelectedWorkflow =
    selectedWorkflow?.stages ||
    selectedWorkflow?.stage_set ||
    selectedWorkflow?.workflow_stages ||
    selectedWorkflow?.stage_list ||
    [];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const numericStageId = Number(stageId);
      if (!numericStageId || Number.isNaN(numericStageId)) {
        setError("Stage must be selected.");
        setLoading(false);
        return;
      }

      const updated = await moveProjectStage(project.id, numericStageId);
      onUpdated?.(updated);
      onClose();
    } catch (err) {
      console.error("moveProjectStage error:", err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setFieldErrors(data);
        setError(
          data.detail ||
            "Failed to move project. Make sure the stage belongs to the chosen workflow."
        );
      } else {
        setError("Failed to move project.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Hooks are all declared; now it's safe to bail when no project
  if (!project) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        className="settings-card"
        style={{
          maxWidth: "520px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: "100%" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
              Move stage: {project.name || project.template_name || `#${project.id}`}
            </h2>
            <button
              type="button"
              onClick={onClose}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
              disabled={loading}
            >
              ×
            </button>
          </div>

          <p
            style={{
              marginTop: 0,
              marginBottom: "0.75rem",
              fontSize: "0.85rem",
              color: "#6b7280",
            }}
          >
            Pick a workflow and stage for this project. Stages are shown by
            name, not number, so you don&apos;t have to memorize IDs.
          </p>

          {error && (
            <div
              style={{
                marginBottom: "0.75rem",
                fontSize: "0.85rem",
                color: "#b91c1c",
              }}
            >
              {error}
            </div>
          )}

          {workflowsError && (
            <div
              style={{
                marginBottom: "0.75rem",
                fontSize: "0.8rem",
                color: "#b45309",
              }}
            >
              {workflowsError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: "0.75rem" }}
          >
            {/* Workflow select with search */}
            <div>
              <label
                style={{
                  fontSize: "0.8rem",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Workflow
              </label>
              <input
                type="text"
                placeholder="Search workflows…"
                value={workflowSearch}
                onChange={(e) => setWorkflowSearch(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.35rem 0.5rem",
                  fontSize: "0.85rem",
                  marginBottom: "0.35rem",
                }}
              />
              <select
                value={selectedWorkflowId || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedWorkflowId(value);
                  setStageId(""); // reset when workflow changes
                }}
                disabled={loadingWorkflows}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                  background: "#ffffff",
                }}
              >
                <option value="">
                  {loadingWorkflows && workflows.length === 0
                    ? "Loading workflows…"
                    : "Select a workflow"}
                </option>
                {filteredWorkflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name}
                  </option>
                ))}
              </select>
              {errorText("workflow") && (
                <p
                  style={{
                    margin: "0.15rem 0 0",
                    fontSize: "0.75rem",
                    color: "#b91c1c",
                  }}
                >
                  {errorText("workflow")}
                </p>
              )}
            </div>

            {/* Stage select by name */}
            <div>
              <label
                style={{
                  fontSize: "0.8rem",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Stage
              </label>
              {loadingWorkflows ? (
                <div
                  style={{
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    padding: "0.4rem 0.6rem",
                    fontSize: "0.9rem",
                    background: "#f9fafb",
                    color: "#6b7280",
                  }}
                >
                  Loading stages…
                </div>
              ) : stagesForSelectedWorkflow.length > 0 ? (
                <select
                  value={stageId || ""}
                  onChange={(e) => setStageId(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    padding: "0.4rem 0.6rem",
                    fontSize: "0.9rem",
                    background: "#ffffff",
                  }}
                >
                  <option value="">Select a stage</option>
                  {stagesForSelectedWorkflow.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name || `Stage #${s.id}`}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#6b7280",
                      marginBottom: "0.25rem",
                    }}
                  >
                    No stages were returned for this workflow. You can still
                    enter a stage ID manually:
                  </p>
                  <input
                    type="number"
                    min="1"
                    value={stageId}
                    onChange={(e) => setStageId(e.target.value)}
                    style={{
                      width: "100%",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      padding: "0.4rem 0.6rem",
                      fontSize: "0.9rem",
                    }}
                  />
                </>
              )}
              {errorText("stage_id") && (
                <p
                  style={{
                    margin: "0.15rem 0 0",
                    fontSize: "0.75rem",
                    color: "#b91c1c",
                  }}
                >
                  {errorText("stage_id")}
                </p>
              )}
            </div>

            {/* Context summary */}
            <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              <div>
                Current stage:{" "}
                <strong>{project.current_stage_name || "—"}</strong>
              </div>
              {project.workflow_name && (
                <div>
                  Current workflow:{" "}
                  <strong>{project.workflow_name || "—"}</strong>
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  padding: "0.45rem 0.9rem",
                  fontSize: "0.9rem",
                  background: "#ffffff",
                  cursor: "pointer",
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Moving…" : "Move stage"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/** Project Board (Kanban) */
export default function ProjectBoard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchProjects();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];

        if (!cancelled) {
          setProjects(items);
        }
      } catch (err) {
        console.error("fetchProjects error:", err);
        if (!cancelled) setError(err.message || "Failed to load projects");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = {
    queued: [],
    active: [],
    completed: [],
    cancelled: [],
  };

  for (const p of projects) {
    const key = p.status || "queued";
    if (!columns[key]) columns[key] = [];
    columns[key].push(p);
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Project board</h1>
          <p>Visual board of projects by status.</p>
        </div>
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Project board</h1>
          <p>Visual board of projects by status.</p>
        </div>
        <p className="text-error">{error}</p>
        <button onClick={() => window.location.reload()} className="btn">
          Retry
        </button>
      </div>
    );
  }

  const columnMeta = [
    { key: "queued", label: "Queued" },
    { key: "active", label: "In progress" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Project board</h1>
        <p>Drag-less Kanban: quick overview by status and stage.</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "1rem",
        }}
      >
        {columnMeta.map((col) => {
          const items = columns[col.key] || [];
          return (
            <div key={col.key} className="settings-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  }}
                >
                  {col.label}
                </h2>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#6b7280",
                  }}
                >
                  {items.length}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {items.length === 0 && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                      padding: "0.5rem",
                      borderRadius: "0.5rem",
                      border: "1px dashed #e5e7eb",
                    }}
                  >
                    No projects in this column.
                  </div>
                )}

                {items.map((p) => {
                  const rush = isRush(p);
                  return (
                    <div
                      key={p.id}
                      style={{
                        borderRadius: "0.75rem",
                        border: "1px solid #e5e7eb",
                        padding: "0.6rem 0.7rem",
                        background: "#ffffff",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                      }}
                    >
                      {/* Title row */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "0.4rem",
                        }}
                      >
                        <div>
                          <Link
                            to={`/projects/${p.id}`}
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: 600,
                            }}
                          >
                            {p.name || p.template_name || `Project #${p.id}`}
                          </Link>
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: "#6b7280",
                              marginTop: "0.15rem",
                            }}
                          >
                            {p.template_name || "Untemplated"}
                            {p.workflow_name && (
                              <>
                                {" · "}
                                <span style={{ fontWeight: 500 }}>
                                  {p.workflow_name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {rush && (
                          <span
                            style={{
                              padding: "0.1rem 0.45rem",
                              borderRadius: "999px",
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              background: "#fee2e2",
                              color: "#b91c1c",
                              border: "1px solid #fecaca",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Rush
                          </span>
                        )}
                      </div>

                      {/* Stage + due + price */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "0.25rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.1rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#6b7280",
                            }}
                          >
                            Stage:
                          </span>
                          <span
                            style={{
                              padding: "0.15rem 0.5rem",
                              borderRadius: "999px",
                              fontSize: "0.75rem",
                              background: "#eff6ff",
                              color: "#1d4ed8",
                              maxWidth: "10rem",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {p.current_stage_name || "Not set"}
                          </span>
                        </div>
                        <div
                          style={{
                            textAlign: "right",
                            fontSize: "0.75rem",
                            color: "#6b7280",
                          }}
                        >
                          <div>Due {formatDate(p.due_date)}</div>
                          <div style={{ fontWeight: 600 }}>
                            {formatMoney(p.expected_price)}
                          </div>
                        </div>
                      </div>

                      {/* Customer line */}
                      {p.customer_name && (
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "#4b5563",
                            marginTop: "0.25rem",
                          }}
                        >
                          Customer:{" "}
                          <span style={{ fontWeight: 500 }}>
                            {p.customer_name ? (
  <Link to={`/customers/${p.customer}`}>
    {p.customer_name}
  </Link>
) : (
  "—"
)}

                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "0.4rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "#9ca3af",
                          }}
                        >
                          #{p.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMoveTarget(p)}
                          style={{
                            borderRadius: "999px",
                            border: "1px solid #bfdbfe",
                            padding: "0.15rem 0.6rem",
                            fontSize: "0.75rem",
                            background: "#eff6ff",
                            cursor: "pointer",
                          }}
                        >
                          Change workflow / stage
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Move stage modal */}
      <MoveStageModal
        project={moveTarget}
        onClose={() => setMoveTarget(null)}
        onUpdated={(updated) => {
          setProjects((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          );
        }}
      />
    </div>
  );
}
