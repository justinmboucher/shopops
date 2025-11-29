// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentShop } from "../api/shops";
import ShopSetupWizard from "../components/settings/ShopSetupWizard";

function Settings() {
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadShop() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCurrentShop();
        if (!ignore) {
          setShop(data);
          setIsFirstTime(false);
          setIsEditingShop(false);
        }
      } catch (err) {
        if (!ignore) {
          const status = err.response?.status;
          const detail = err.response?.data?.detail;

          // ShopView raises NotFound("Current user has no shop configured.")
          if (status === 404 && detail?.includes("no shop configured")) {
            setIsFirstTime(true);
            setShop(null);
            setError(null);
            setIsEditingShop(false);
          } else {
            setError(
              detail ||
                err.response?.data?.error ||
                err.message ||
                "Failed to load settings"
            );
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadShop();
    return () => {
      ignore = true;
    };
  }, []);

  const showWizard = isFirstTime || isEditingShop;

  if (loading) {
    return (
      <main className="page page-settings">
        <header className="page-header">
          <h1>Settings</h1>
          <p>
            Tune ShopOps so it matches how your shop runs and how you like to
            work.
          </p>
        </header>
        <p>Loading shop profile…</p>
      </main>
    );
  }

  return (
    <main className="page page-settings">
      <header className="page-header">
        <h1>Settings</h1>
        <p>
          Tune ShopOps so it matches how your shop runs and how you like to
          work.
        </p>
      </header>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
          Error: {error}
        </div>
      )}

      {/* Shop setup / edit wizard */}
      {showWizard && (
        <section className="settings-section" style={{ marginBottom: "1.5rem" }}>
          <ShopSetupWizard
            shop={shop}
            onCompleted={(updatedShop) => {
              setShop(updatedShop);
              setIsFirstTime(false);
              setIsEditingShop(false);
            }}
          />
        </section>
      )}

      {/* Settings cards */}
      <section className="settings-section">
        <div className="settings-grid">
          {/* Shop profile card */}
          <button
            type="button"
            className="settings-card settings-card--clickable"
            onClick={() => setIsEditingShop(true)}
          >
            <div className="settings-card__icon">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="settings-card__icon-svg"
              >
                <path
                  d="M4 11.5L12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-5h-4v5H5a1 1 0 0 1-1-1v-8.5z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="settings-card__body">
              <h2>Shop profile</h2>
              <p>
                Update your shop name, timezone, and default pricing
                preferences.
              </p>
              <p className="settings-card__meta">
                {shop
                  ? `Current shop: ${shop.name} (${shop.timezone})`
                  : "No shop configured yet."}
              </p>
            </div>
            <div className="settings-card__cta">
              <span className="settings-card__cta-text">
                {shop ? "Edit shop" : "Set up shop"}
              </span>
            </div>
          </button>

          {/* Workflows card */}
          <button
            type="button"
            className="settings-card settings-card--clickable"
            onClick={() => navigate("/workflows")}
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
              <h2>Workflows</h2>
              <p>Manage the stages your projects move through.</p>
              <p className="settings-card__meta">
                Different types of projects move differently. Create workflows
                that match how your shop actually works.
              </p>
            </div>
            <div className="settings-card__cta">
              <span className="settings-card__cta-text">Open workflows</span>
            </div>
          </button>

          {/* Account card (placeholder) */}
          <div
            className="settings-card settings-card--disabled"
            aria-disabled="true"
          >
            <div className="settings-card__icon">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="settings-card__icon-svg"
              >
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5C19 16 16 14 12 14Z" />
              </svg>
            </div>
            <div className="settings-card__body">
              <h2>Account</h2>
              <p>Manage your login and personal details.</p>
              <span className="settings-card__badge">Coming soon</span>
            </div>
          </div>

          {/* Preferences card (placeholder) */}
          <div
            className="settings-card settings-card--disabled"
            aria-disabled="true"
          >
            <div className="settings-card__icon">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="settings-card__icon-svg"
              >
                <path d="M6 6h12v2H6zM8 11h10v2H8zM5 16h12v2H5z" />
              </svg>
            </div>
            <div className="settings-card__body">
              <h2>Preferences</h2>
              <p>Control default views and notifications.</p>
              <span className="settings-card__badge">Coming soon</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Settings;
