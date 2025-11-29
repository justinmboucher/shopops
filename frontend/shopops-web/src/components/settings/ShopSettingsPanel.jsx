// src/components/settings/ShopSettingsPanel.jsx

function ShopSettingsPanel({ shop, onEdit }) {
  if (!shop) {
    return (
      <section>
        <h3>Shop configuration</h3>
        <p>No shop found for your account.</p>
        {onEdit && (
          <button type="button" onClick={onEdit}>
            Create shop
          </button>
        )}
      </section>
    );
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
    <section className="settings-card">
      <header className="settings-card__header">
        <h3>Shop configuration</h3>
        <p>Update your shop name, region, and default pricing preferences.</p>
      </header>

      <dl className="settings-list">
        <div className="settings-list__item">
          <dt>Shop name</dt>
          <dd>{name || <span className="muted">Not set</span>}</dd>
        </div>

        <div className="settings-list__item">
          <dt>Description</dt>
          <dd>
            {description ? (
              description
            ) : (
              <span className="muted">No description</span>
            )}
          </dd>
        </div>

        <div className="settings-list__item">
          <dt>Timezone</dt>
          <dd>{timezone || <span className="muted">Not set</span>}</dd>
        </div>

        <div className="settings-list__item">
          <dt>Currency</dt>
          <dd>{currency || <span className="muted">USD (default)</span>}</dd>
        </div>

        <div className="settings-list__item">
          <dt>Default hourly rate</dt>
          <dd>
            {default_hourly_rate != null && Number(default_hourly_rate) > 0 ? (
              <>${Number(default_hourly_rate).toFixed(2)} / hour</>
            ) : (
              <span className="muted">Not set</span>
            )}
          </dd>
        </div>

        <div className="settings-list__item">
          <dt>Default markup</dt>
          <dd>
            {default_markup_pct != null && Number(default_markup_pct) > 0 ? (
              <>{Number(default_markup_pct).toFixed(1)}%</>
            ) : (
              <span className="muted">Not set</span>
            )}
          </dd>
        </div>

        <div className="settings-list__item">
          <dt>Theme</dt>
          <dd>{theme || <span className="muted">System</span>}</dd>
        </div>

        {created_at && (
          <div className="settings-list__item">
            <dt>Created</dt>
            <dd>{new Date(created_at).toLocaleString()}</dd>
          </div>
        )}

        {updated_at && (
          <div className="settings-list__item">
            <dt>Last updated</dt>
            <dd>{new Date(updated_at).toLocaleString()}</dd>
          </div>
        )}
      </dl>

      {onEdit && (
        <div className="settings-card__footer">
          <button type="button" onClick={onEdit}>
            Edit shop
          </button>
        </div>
      )}
    </section>
  );
}

export default ShopSettingsPanel;