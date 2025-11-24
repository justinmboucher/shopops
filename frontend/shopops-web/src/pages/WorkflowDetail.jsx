// src/pages/WorkflowDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchWorkflow, updateWorkflow } from "../api/workflows";

function WorkflowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchWorkflow(id);
        if (!ignore) {
          setWorkflow(data);
          setForm({
            name: data.name || "",
            description: data.description || "",
          });
        }
      } catch (err) {
        if (!ignore) {
          const message =
            err.response?.data?.detail ||
            err.response?.data?.error ||
            err.message ||
            "Failed to load workflow";
          setError(message);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload = {
        ...workflow,
        name: form.name,
        description: form.description,
      };
      const updated = await updateWorkflow(id, payload);
      setWorkflow(updated);
      // Could show a toast; for now, go back to list
      navigate("/workflows");
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Failed to save workflow";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading workflow…</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Workflow</h2>
        <p style={{ color: "crimson" }}>Error: {error}</p>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div>
        <h2>Workflow</h2>
        <p>No workflow found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Edit workflow</h2>
      <p
        style={{
          margin: "0.25rem 0 1rem",
          fontSize: "0.9rem",
          color: "#6b7280",
        }}
      >
        Adjust the basic details for this workflow.
      </p>

      <div
        style={{
          maxWidth: "640px",
          borderRadius: "0.75rem",
          border: "1px solid #e5e7eb",
          padding: "1rem",
          background: "#ffffff",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div style={{ marginBottom: "0.75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              marginBottom: "0.25rem",
            }}
          >
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            style={{
              width: "100%",
              padding: "0.4rem 0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontSize: "0.9rem",
            }}
          />
        </div>

        <div style={{ marginBottom: "0.75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              marginBottom: "0.25rem",
            }}
          >
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            style={{
              width: "100%",
              padding: "0.4rem 0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontSize: "0.9rem",
            }}
          />
        </div>

        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/workflows")}
            disabled={saving}
            style={{
              padding: "0.35rem 0.8rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.35rem 0.8rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkflowDetail;
