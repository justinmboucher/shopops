// src/components/settings/ShopSettingsPanel.jsx
// src/components/settings/ShopSettingsPanel.jsx
function ShopSettingsPanel({ shop, onEdit }) {
  if (!shop) {
    return <p>No shop found for your account.</p>;
  }

  const {
    name,
    description,
    timezone,
    currency,
    default_hourly_rate,
    default_markup_pct,
    theme,
    created_at,
    updated_at,
  } = shop;

  return (
    <div
      style={{
        borderRadius: "0.75rem",
        border: "1px solid #e5e7eb",
        padding: "1rem",
        background: "#ffffff",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
        maxWidth: "640px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Shop configuration</h3>

      <div
        style={{
          marginTop: "0.5rem",
          fontSize: "0.9rem",
          color: "#4b5563",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        <div>
          <strong>Name:</strong> {name}
        </div>
        {description && (
          <div>
            <strong>Description:</strong> {description}
          </div>
        )}
        {timezone && (
          <div>
            <strong>Timezone:</strong> {timezone}
          </div>
        )}
        {currency && (
          <div>
            <strong>Currency:</strong> {currency}
          </div>
        )}
        {default_hourly_rate != null && (
          <div>
            <strong>Default hourly rate:</strong> {default_hourly_rate}
          </div>
        )}
        {default_markup_pct != null && (
          <div>
            <strong>Default markup:</strong> {default_markup_pct}%
          </div>
        )}
        {theme && (
          <div>
            <strong>Theme:</strong> {theme}
          </div>
        )}
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
          onClick={() => onEdit && onEdit()}
        >
          Edit shop
        </button>
      </div>
    </div>
  );
}

export default ShopSettingsPanel;