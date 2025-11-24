// src/components/shops/ShopCard.jsx
function ShopCard({ shop }) {
  const {
    id,
    name,
    description,
    timezone,
    currency,
    default_hourly_rate,
    default_markup_pct,
    theme,
  } = shop;

  const handleView = () => {
    console.log("View shop clicked (detail/edit not implemented yet)", id);
  };

  const handleEdit = () => {
    console.log("Edit shop clicked (not implemented yet)", id);
  };

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
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "0.75rem",
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
            {name || `Shop #${id}`}
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

        {theme && (
          <span
            style={{
              fontSize: "0.7rem",
              padding: "0.15rem 0.4rem",
              borderRadius: "999px",
              background: "#f9fafb",
              color: "#4b5563",
              border: "1px solid #e5e7eb",
              whiteSpace: "nowrap",
            }}
          >
            Theme: {theme}
          </span>
        )}
      </div>

      {/* Meta */}
      <div
        style={{
          marginTop: "0.25rem",
          fontSize: "0.8rem",
          color: "#6b7280",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        {timezone && <span>TZ: {timezone}</span>}
        {currency && <span>Currency: {currency}</span>}
        {default_hourly_rate != null && (
          <span>Rate: {default_hourly_rate} / hr</span>
        )}
        {default_markup_pct != null && (
          <span>Markup: {default_markup_pct}%</span>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "0.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: "0.8rem",
        }}
      >
        <span style={{ color: "#9ca3af" }}>Shop ID: {id}</span>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            type="button"
            onClick={handleView}
            style={{
              padding: "0.25rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            View
          </button>
          <button
            type="button"
            onClick={handleEdit}
            style={{
              padding: "0.25rem 0.6rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShopCard;
