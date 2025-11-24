// src/components/workflows/WorkflowCard.jsx
function WorkflowCard({ workflow }) {
  const {
    name,
    description,
    is_default,
    is_active,
    created_at,
    updated_at,
  } = workflow;

  const createdLabel = created_at
    ? new Date(created_at).toLocaleDateString()
    : null;
  const updatedLabel = updated_at
    ? new Date(updated_at).toLocaleDateString()
    : null;

  return (
    <div
      style={{
        borderRadius: "0.75rem",
        border: "1px solid #e5e7eb",
        padding: "1rem",
        background: "#ffffff",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {/* Header row: name + badges */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "0.5rem",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            {name}
          </h3>
          {description && (
            <p
              style={{
                margin: "0.25rem 0 0",
                fontSize: "0.85rem",
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

      {/* Footer meta */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: "0.5rem",
          fontSize: "0.75rem",
          color: "#6b7280",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
          {createdLabel && <span>Created: {createdLabel}</span>}
          {updatedLabel && <span>Updated: {updatedLabel}</span>}
        </div>

        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            type="button"
            style={{
              padding: "0.25rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
            // TODO: wire to a detail/edit view
          >
            View
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
            }}
            // TODO: wire to assign-to-shop or edit stages
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkflowCard;
