import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWorkflow } from "../api/workflows";

function WorkflowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadWorkflow() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchWorkflow(id);
        if (!ignore) {
          setWorkflow(data);
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

    loadWorkflow();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleBack = () => {
    navigate("/workflows");
  };

  if (loading) {
    return <div>Loading workflow…</div>;
  }

  if (error) {
    return (
      <div>
        <button
          type="button"
          onClick={handleBack}
          style={{
            marginBottom: "1rem",
            padding: "0.25rem 0.6rem",
            borderRadius: "0.5rem",
            border: "1px solid #d1d5db",
            background: "#f9fafb",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          ← Back to workflows
        </button>
        <h2>Workflow</h2>
        <p style={{ color: "crimson" }}>Error: {error}</p>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div>
        <button
          type="button"
          onClick={handleBack}
          style={{
            marginBottom: "1rem",
            padding: "0.25rem 0.6rem",
            borderRadius: "0.5rem",
            border: "1px solid #d1d5db",
            background: "#f9fafb",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          ← Back to workflows
        </button>
        <p>Workflow not found.</p>
      </div>
    );
  }

  const { name, description, is_default, is_active, created_at, updated_at } = workflow;

  return (
    <div>
      <button
        type="button"
        onClick={handleBack}
        style={{
          marginBottom: "1rem",
          padding: "0.25rem 0.6rem",
          borderRadius: "0.5rem",
          border: "1px solid #d1d5db",
          background: "#f9fafb",
          fontSize: "0.8rem",
          cursor: "pointer",
        }}
      >
        ← Back to workflows
      </button>

      <div
        style={{
          borderRadius: "0.9rem",
          border: "1px solid #e5e7eb",
          padding: "1.25rem",
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.12)",
          maxWidth: "640px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>{name}</h2>
            {description && (
              <p
                style={{
                  margin: "0.5rem 0 0",
                  fontSize: "0.9rem",
                  color: "#4b5563",
                }}
              >
                {description}
              </p>
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.25rem",
              justifyContent: "flex-end",
            }}
          >
            {is_default && (
              <span
                style={{
                  fontSize: "0.7rem",
                  padding: "0.15rem 0.4rem",
                  borderRadius: "999px",
                  background: "#eef2ff",
                  color: "#3730a3",
                  border: "1px solid #c7d2fe",
                }}
              >
                Default
              </span>
            )}
            <span
              style={{
                fontSize: "0.7rem",
                padding: "0.15rem 0.4rem",
                borderRadius: "999px",
                background: is_active ? "#ecfdf3" : "#f9fafb",
                color: is_active ? "#166534" : "#6b7280",
                border: `1px solid ${is_active ? "#bbf7d0" : "#e5e7eb"}`,
              }}
            >
              {is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            paddingTop: "0.75rem",
            borderTop: "1px dashed #e5e7eb",
            fontSize: "0.8rem",
            color: "#6b7280",
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            {created_at && (
              <div>Created: {new Date(created_at).toLocaleString()}</div>
            )}
            {updated_at && (
              <div>Updated: {new Date(updated_at).toLocaleString()}</div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            {/* Stubs for future features */}
            <button
              type="button"
              style={{
                padding: "0.25rem 0.6rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                background: "#f9fafb",
                fontSize: "0.75rem",
                cursor: "pointer",
                marginLeft: "0.25rem",
              }}
            >
              Duplicate
            </button>
            <button
              type="button"
              style={{
                padding: "0.25rem 0.6rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                fontSize: "0.75rem",
                cursor: "pointer",
                marginLeft: "0.25rem",
              }}
            >
              Edit workflow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkflowDetail;
