// src/pages/Workflows.jsx
import { useEffect, useState } from "react";
import { fetchWorkflows } from "../api/workflows";
import WorkflowCard from "../components/workflows/WorkflowCard";

function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadWorkflows() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchWorkflows();
        if (!ignore) {
          setWorkflows(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!ignore) {
          const message =
            err.response?.data?.detail ||
            err.response?.data?.error ||
            err.message ||
            "Failed to load workflows";
          setError(message);
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

  if (loading) {
    return <div>Loading workflows…</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Workflows</h2>
        <p style={{ color: "crimson" }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Workflows</h2>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
            Definitions for how work moves through your shop.
          </p>
        </div>

        <button
          type="button"
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#2563eb",
            color: "#ffffff",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
          // TODO: hook this to a create-modal or create-page
        >
          + New workflow
        </button>
      </div>

      {workflows.length === 0 ? (
        <p>No workflows defined yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1rem",
          }}
        >
          {workflows.map((wf) => (
            <WorkflowCard key={wf.id} workflow={wf} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Workflows;
