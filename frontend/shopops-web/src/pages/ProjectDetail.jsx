// src/pages/ProjectDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProject, updateProject } from "../api/projects";

function formatDateTime(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function formatMoney(amount, currency) {
  if (amount == null || isNaN(Number(amount))) return "—";
  const symbol = currency === "USD" || !currency ? "$" : `${currency} `;
  return `${symbol}${Number(amount).toFixed(2)}`;
}

// Rush logic: due today / within 3 days / overdue
function isRush(project) {
  if (!project?.due_date) return false;
  const due = new Date(project.due_date);
  if (Number.isNaN(due.getTime())) return false;

  const now = new Date();
  const msDiff = due.getTime() - now.getTime();
  const daysDiff = msDiff / (1000 * 60 * 60 * 24);

  // Past due OR due within next 3 days
  return daysDiff <= 3;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // edit state
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    notes: "",
    due_date: "",
    expected_price: "",
  });

  // Load project
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProject(id);
        if (!cancelled) {
          setProject(data);
          setForm({
            name: data.name || "",
            quantity:
              data.quantity != null && !Number.isNaN(Number(data.quantity))
                ? String(data.quantity)
                : "",
            notes: data.notes || "",
            due_date: data.due_date || "",
            expected_price:
              data.expected_price != null
                ? String(data.expected_price)
                : "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.status === 404
              ? "Project not found."
              : "Failed to load project."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function startEdit() {
    if (!project) return;
    setEditMode(true);
    setEditError(null);
    setFieldErrors({});
    setForm({
      name: project.name || "",
      quantity:
        project.quantity != null && !Number.isNaN(Number(project.quantity))
          ? String(project.quantity)
          : "",
      notes: project.notes || "",
      due_date: project.due_date || "",
      expected_price:
        project.expected_price != null
          ? String(project.expected_price)
          : "",
    });
  }

  function cancelEdit() {
    setEditMode(false);
    setEditError(null);
    setFieldErrors({});
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!project) return;

    setSaving(true);
    setEditError(null);
    setFieldErrors({});

    try {
      const payload = {};

      // Name & notes
      payload.name = form.name || null;
      payload.notes = form.notes || "";

      // Quantity (optional but numeric)
      if (form.quantity !== "") {
        const qtyNum = Number(form.quantity);
        if (Number.isNaN(qtyNum) || qtyNum <= 0) {
          setSaving(false);
          setEditError("Quantity must be a positive number.");
          return;
        }
        payload.quantity = qtyNum;
      }

      // Due date (ISO date string, or null to clear)
      payload.due_date = form.due_date || null;

      // Expected price (optional, non-negative)
      if (form.expected_price !== "") {
        const priceNum = Number(form.expected_price);
        if (Number.isNaN(priceNum) || priceNum < 0) {
          setSaving(false);
          setEditError("Expected price must be a non-negative number.");
          return;
        }
        payload.expected_price = priceNum;
      } else {
        payload.expected_price = null;
      }

      const updated = await updateProject(project.id, payload);
      setProject(updated);

      // Sync form with updated data
      setForm({
        name: updated.name || "",
        quantity:
          updated.quantity != null && !Number.isNaN(Number(updated.quantity))
            ? String(updated.quantity)
            : "",
        notes: updated.notes || "",
        due_date: updated.due_date || "",
        expected_price:
          updated.expected_price != null
            ? String(updated.expected_price)
            : "",
      });

      setEditMode(false);
    } catch (err) {
      console.error("updateProject error:", err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setFieldErrors(data);
        setEditError("Please fix the highlighted fields.");
      } else {
        setEditError("Failed to save changes.");
      }
    } finally {
      setSaving(false);
    }
  }

  const errorText = (field) =>
    Array.isArray(fieldErrors[field]) ? fieldErrors[field].join(" ") : null;

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Project</h1>
          <p>Loading project details…</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Project</h1>
        </div>
        <div className="settings-card">
          <p style={{ marginTop: 0, color: "#b91c1c" }}>{error || "Not found"}</p>
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/projects")}
          >
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  const rush = isRush(project);

  return (
    <div className="page">
      {/* Header with Edit button on the right */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {project.name || `Project #${project.id}`}
            {rush && (
              <span
                style={{
                  padding: "0.15rem 0.6rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
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
          </h1>
          <p>
            Template:{" "}
            {project.template_name ? (
              <span>{project.template_name}</span>
            ) : (
              "—"
            )}{" "}
            · Workflow: {project.workflow_name || "—"}
          </p>
        </div>

        <div style={{ marginTop: "0.25rem" }}>
          <button
            type="button"
            className="btn"
            onClick={startEdit}
            style={{ padding: "0.4rem 1rem", fontSize: "0.9rem" }}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div
        className="settings-card"
        style={{ marginBottom: "1.5rem", display: "flex", gap: "1.5rem" }}
      >
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Overview</h2>
          <div style={{ fontSize: "0.9rem" }}>
            <div style={{ marginBottom: "0.25rem" }}>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  padding: "0.2rem 0.55rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  background:
                    {
                      completed: "#d1fae5",
                      active: "#dbeafe",
                      queued: "#e5e7eb",
                      cancelled: "#fee2e2",
                    }[project.status] || "#e5e7eb",
                  color:
                    {
                      completed: "#065f46",
                      active: "#1e40af",
                      queued: "#374151",
                      cancelled: "#991b1b",
                    }[project.status] || "#374151",
                }}
              >
                {project.status || "—"}
              </span>
            </div>
            <div style={{ marginBottom: "0.25rem" }}>
              <strong>Current stage:</strong>{" "}
              {project.current_stage_name || "—"}
            </div>
            <div style={{ marginBottom: "0.25rem" }}>
              <strong>Quantity:</strong> {project.quantity ?? "—"}
            </div>
            <div style={{ marginBottom: "0.25rem" }}>
              <strong>Due date:</strong>{" "}
              <span
                style={{
                  fontWeight: rush ? 700 : 400,
                  color: rush ? "#b91c1c" : "#111827",
                }}
              >
                {formatDate(project.due_date)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Value</h2>
          <div style={{ fontSize: "0.9rem" }}>
            <div style={{ marginBottom: "0.25rem" }}>
              <strong>Expected price:</strong>{" "}
              {formatMoney(project.expected_price, project.expected_currency)}
            </div>
            <div style={{ marginBottom: "0.25rem" }}>
              <strong>Estimated hours:</strong>{" "}
              {project.estimated_hours ?? "—"}
            </div>
            <div style={{ marginBottom: "0.25rem" }}>
              <strong>Actual hours:</strong> {project.actual_hours ?? "—"}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Customer</h2>
          <div style={{ fontSize: "0.9rem" }}>
            <div style={{ marginBottom: "0.25rem" }}>
              <strong>Name:</strong> {project.customer_name || "—"}
            </div>
            {/* Future: link to Customer detail page */}
          </div>
        </div>
      </div>

      {/* Notes display */}
      <div className="settings-card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Notes</h2>
        <p
          style={{
            marginTop: 0,
            whiteSpace: "pre-wrap",
            fontSize: "0.9rem",
            color: project.notes ? "#111827" : "#6b7280",
          }}
        >
          {project.notes || "No notes yet."}
        </p>
      </div>

      {/* Timestamps */}
      <div className="settings-card">
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>
          Timestamps & audit
        </h2>
        <div style={{ fontSize: "0.85rem", color: "#4b5563" }}>
          <div style={{ marginBottom: "0.25rem" }}>
            <strong>Created at:</strong> {formatDateTime(project.created_at)}
          </div>
          <div style={{ marginBottom: "0.25rem" }}>
            <strong>Updated at:</strong> {formatDateTime(project.updated_at)}
          </div>
          {project.status === "cancelled" && (
            <>
              <div style={{ marginBottom: "0.25rem" }}>
                <strong>Cancelled at:</strong>{" "}
                {formatDateTime(project.cancelled_at)}
              </div>
              <div style={{ marginBottom: "0.25rem" }}>
                <strong>Cancel reason:</strong>{" "}
                {project.cancel_reason || "—"}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <Link to="/projects" className="btn">
          Back to projects
        </Link>
      </div>

      {/* Edit modal */}
      {editMode && (
        <>
          {/* Backdrop */}
          <div
            onClick={cancelEdit}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              zIndex: 40,
            }}
          />
          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <div
              className="settings-card"
              style={{
                maxWidth: "520px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "var(--settings-card-bg)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "1rem" }}>
                  Edit project details
                </h2>
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    lineHeight: 1,
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleSave}
                style={{ display: "grid", gap: "0.75rem" }}
              >
                {editError && (
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#b91c1c",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {editError}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Project name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Optional display name"
                    style={{
                      width: "100%",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      padding: "0.4rem 0.6rem",
                      fontSize: "0.9rem",
                    }}
                  />
                  {errorText("name") && (
                    <p
                      style={{
                        margin: "0.15rem 0 0",
                        fontSize: "0.75rem",
                        color: "#b91c1c",
                      }}
                    >
                      {errorText("name")}
                    </p>
                  )}
                </div>

                {/* Quantity + due date */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        fontSize: "0.8rem",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(e) =>
                        handleChange("quantity", e.target.value)
                      }
                      style={{
                        width: "100%",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        padding: "0.4rem 0.6rem",
                        fontSize: "0.9rem",
                      }}
                    />
                    {errorText("quantity") && (
                      <p
                        style={{
                          margin: "0.15rem 0 0",
                          fontSize: "0.75rem",
                          color: "#b91c1c",
                        }}
                      >
                        {errorText("quantity")}
                      </p>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        fontSize: "0.8rem",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      Due date
                    </label>
                    <input
                      type="date"
                      value={form.due_date}
                      onChange={(e) =>
                        handleChange("due_date", e.target.value)
                      }
                      style={{
                        width: "100%",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        padding: "0.4rem 0.6rem",
                        fontSize: "0.9rem",
                      }}
                    />
                    {errorText("due_date") && (
                      <p
                        style={{
                          margin: "0.15rem 0 0",
                          fontSize: "0.75rem",
                          color: "#b91c1c",
                        }}
                      >
                        {errorText("due_date")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Expected price */}
                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Expected price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.expected_price}
                    onChange={(e) =>
                      handleChange("expected_price", e.target.value)
                    }
                    placeholder="Optional – for planning only"
                    style={{
                      width: "100%",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      padding: "0.4rem 0.6rem",
                      fontSize: "0.9rem",
                    }}
                  />
                  {errorText("expected_price") && (
                    <p
                      style={{
                        margin: "0.15rem 0 0",
                        fontSize: "0.75rem",
                        color: "#b91c1c",
                      }}
                    >
                      {errorText("expected_price")}
                    </p>
                  )}
                </div>

                {/* Notes editor */}
                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      handleChange("notes", e.target.value)
                    }
                    rows={4}
                    style={{
                      width: "100%",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      padding: "0.4rem 0.6rem",
                      fontSize: "0.9rem",
                      resize: "vertical",
                    }}
                  />
                  {errorText("notes") && (
                    <p
                      style={{
                        margin: "0.15rem 0 0",
                        fontSize: "0.75rem",
                        color: "#b91c1c",
                      }}
                    >
                      {errorText("notes")}
                    </p>
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
                    onClick={cancelEdit}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      padding: "0.45rem 0.9rem",
                      fontSize: "0.9rem",
                      background: "#ffffff",
                      cursor: "pointer",
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn" disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
