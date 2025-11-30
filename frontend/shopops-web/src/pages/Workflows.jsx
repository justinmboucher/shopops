// src/pages/Workflows.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

function Workflows() {
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Load workflows on mount
  useEffect(() => {
    let ignore = false;

    async function loadWorkflows() {
      try {
        setLoading(true);
        setError(null);
        const resp = await api.get("/workflows/");

// Supports both paginated and non-paginated DRF responses
const list = Array.isArray(resp.data)
  ? resp.data
  : resp.data.results;

setWorkflows(list || []);

      } catch (err) {
        if (!ignore) {
          console.error("Failed to load workflows", err);
          setError(
            err.response?.data?.detail ||
              err.response?.data?.error ||
              err.message ||
              "Failed to load workflows"
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadWorkflows();
    return () => {
      ignore = true;
    };
  }, []);

  // “New workflow” button handler
  const handleNewWorkflowClick = () => {
    setIsCreating(true);
    setNewName("");
    setNewDescription("");
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setError(null);
      const payload = {
        name: newName.trim(),
        description: newDescription.trim() || null,
      };
      const resp = await api.post("/workflows/", payload);
      // append newly created workflow to list
      setWorkflows((prev) => [...prev, resp.data]);
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to create workflow", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Failed to create workflow"
      );
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
  };

  const handleOpenWorkflow = (wfId) => {
    // matches your AppRouter route /workflows/:id
    navigate(`/workflows/${wfId}`);
  };

  if (loading) {
    return (
      <main className="page">
        <h1>Workflows</h1>
        <p>Loading workflows…</p>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Workflows</h1>
        <p>
          Different types of projects move differently. Create workflows that
          match how your shop actually works.
        </p>
      </header>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
          Error: {error}
        </div>
      )}

      {/* Top bar: title + New workflow button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
          Your workflows
        </h2>
        <button
          type="button"
          className="btn"
          onClick={handleNewWorkflowClick}
        >
          New workflow
        </button>
      </div>

      {/* Inline create form shown when New workflow is clicked */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          style={{
            border: "1px solid #d1d5db",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            background: "#ffffff",
          }}
        >
          <div style={{ marginBottom: "0.5rem" }}>
            <label
              htmlFor="wf-name"
              style={{ display: "block", fontSize: "0.85rem", marginBottom: 4 }}
            >
              Workflow name
            </label>
            <input
              id="wf-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Furniture builds, Cutting boards, etc."
              required
              style={{ width: "100%", padding: "0.4rem 0.5rem" }}
            />
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label
              htmlFor="wf-description"
              style={{ display: "block", fontSize: "0.85rem", marginBottom: 4 }}
            >
              Description (optional)
            </label>
            <textarea
              id="wf-description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="What kinds of projects is this for?"
              rows={2}
              style={{ width: "100%", padding: "0.4rem 0.5rem" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="submit" className="btn">
              Save workflow
            </button>
            <button
              type="button"
              className="btn"
              style={{
                backgroundColor: "#e5e7eb",
                color: "#111827",
              }}
              onClick={handleCancelCreate}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List of existing workflows */}
      {workflows.length === 0 ? (
        <p>No workflows yet. Create your first workflow to define your stages.</p>
      ) : (
        <div className="settings-grid">
          {workflows.map((wf) => (
            <button
              key={wf.id}
              type="button"
              className="settings-card settings-card--clickable"
              onClick={() => handleOpenWorkflow(wf.id)}
            >
              <div className="settings-card__icon">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="settings-card__icon-svg"
                >
                  <rect x="3" y="4" width="6" height="16" rx="1" />
                  <rect x="10" y="4" width="6" height="10" rx="1" />
                  <rect x="17" y="4" width="4" height="13" rx="1" />
                </svg>
              </div>
              <div className="settings-card__body">
                <h2>{wf.name}</h2>
                <p>{wf.description || "No description"}</p>
                <p className="settings-card__meta">
                  {wf.is_default ? "Default workflow" : "Custom workflow"}
                </p>
              </div>
              <div className="settings-card__cta">
                <span className="settings-card__cta-text">Open</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}

export default Workflows;
