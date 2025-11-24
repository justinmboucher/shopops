// src/pages/ShopDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchShop } from "../api/shops";

function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadShop() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchShop(id);
        if (!ignore) {
          setShop(data);
        }
      } catch (err) {
        if (!ignore) {
          const message =
            err.response?.data?.detail ||
            err.response?.data?.error ||
            err.message ||
            "Failed to load shop";
          setError(message);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadShop();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleBack = () => {
    navigate("/shops");
  };

  if (loading) {
    return <div>Loading shop…</div>;
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
          ← Back to shops
        </button>
        <h2>Shop</h2>
        <p style={{ color: "crimson" }}>Error: {error}</p>
      </div>
    );
  }

  if (!shop) {
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
          ← Back to shops
        </button>
        <p>Shop not found.</p>
      </div>
    );
  }

  const {
    name,
    description,
    location,
    workflow,
    workflow_name,
    workflow_id,
  } = shop;

  const workflowObj = typeof workflow === "object" ? workflow : null;
  const effectiveWorkflowId =
    workflowObj?.id || workflow_id || (typeof workflow === "number" ? workflow : null);
  const effectiveWorkflowName =
    workflowObj?.name || workflow_name || (effectiveWorkflowId ? `Workflow #${effectiveWorkflowId}` : "None");

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
        ← Back to shops
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
        <h2 style={{ margin: 0 }}>{name || `Shop #${id}`}</h2>

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

        {location && (
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "0.85rem",
              color: "#6b7280",
            }}
          >
            <strong>Location:</strong> {location}
          </p>
        )}

        <div
          style={{
            marginTop: "1rem",
            paddingTop: "0.75rem",
            borderTop: "1px dashed #e5e7eb",
            fontSize: "0.85rem",
          }}
        >
          <h3
            style={{
              margin: "0 0 0.5rem",
              fontSize: "0.95rem",
            }}
          >
            Workflow
          </h3>

          {effectiveWorkflowId ? (
            <p style={{ margin: 0 }}>
              Uses workflow:{" "}
              <Link to={`/workflows/${effectiveWorkflowId}`}>
                {effectiveWorkflowName}
              </Link>
            </p>
          ) : (
            <p style={{ margin: 0 }}>No workflow assigned yet.</p>
          )}

          <button
            type="button"
            style={{
              marginTop: "0.5rem",
              padding: "0.25rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
            // TODO: open change-workflow modal
            onClick={() =>
              console.log("Change workflow clicked (not implemented yet)")
            }
          >
            Change workflow
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShopDetail;
