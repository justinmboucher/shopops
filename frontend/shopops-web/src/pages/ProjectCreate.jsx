// src/pages/ProjectCreate.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../api/projects";

function ProjectCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    customer_name: "",
    reference: "",
    stage: "",
    due_date: "",
    estimated_value: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Build payload in a backend-friendly way.
      const payload = { ...form };

      // Normalize some fields if your backend uses different names.
      // You can tweak this mapping to match your serializer exactly.
      if (payload.estimated_value !== "") {
        const num = Number(payload.estimated_value);
        if (!Number.isNaN(num)) payload.estimated_value = num;
      } else {
        delete payload.estimated_value;
      }

      if (!payload.reference) delete payload.reference;
      if (!payload.notes) delete payload.notes;
      if (!payload.stage) delete payload.stage;
      if (!payload.customer_name) delete payload.customer_name;

      await createProject(payload);

      // After successful creation, go back to projects list
      navigate("/projects");
    } catch (err) {
      console.error("Failed to create project", err);
      setError(err.message || "Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page project-create">
      <div className="page-header">
        <h1 className="page-title">New project</h1>
        <p className="page-subtitle">
          Capture the basics of a project so you can track it on the board,
          link inventory, and log work.
        </p>
      </div>

      <section className="panel" style={{ maxWidth: 720 }}>
        <div className="panel-header">
          <div>
            <div className="panel-title">Project details</div>
            <div className="panel-subtitle">
              You can refine the workflow, inventory, and money events later.
            </div>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {error && (
            <p className="text-error" style={{ gridColumn: "1 / -1" }}>
              {error}
            </p>
          )}

          <div className="form-field form-field--full">
            <label className="form-label">Project name</label>
            <input
              className="form-input"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Walnut dining table, custom built-ins…"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Customer / client</label>
            <input
              className="form-input"
              type="text"
              value={form.customer_name}
              onChange={(e) => handleChange("customer_name", e.target.value)}
              placeholder="e.g. Taylor family, Riverstone Cafe…"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Reference / internal ID</label>
            <input
              className="form-input"
              type="text"
              value={form.reference}
              onChange={(e) => handleChange("reference", e.target.value)}
              placeholder="Optional job number or reference"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Stage (optional)</label>
            <input
              className="form-input"
              type="text"
              value={form.stage}
              onChange={(e) => handleChange("stage", e.target.value)}
              placeholder="e.g. Intake, Design, Build…"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Target due date</label>
            <input
              className="form-input"
              type="date"
              value={form.due_date}
              onChange={(e) => handleChange("due_date", e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Estimated project value</label>
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              value={form.estimated_value}
              onChange={(e) =>
                handleChange("estimated_value", e.target.value)
              }
              placeholder="e.g. 1250.00"
            />
          </div>

          <div className="form-field form-field--full">
            <label className="form-label">Notes</label>
            <textarea
              className="form-input form-textarea"
              rows={4}
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Any constraints, special requests, or quick description of the work."
            />
          </div>

          <div
            className="form-field form-field--full"
            style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/projects")}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Creating…" : "Create project"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProjectCreate;
