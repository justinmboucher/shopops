// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import { fetchCurrentShop } from "../api/shops";
import ShopSetupWizard from "../components/settings/ShopSetupWizard";
import ShopSettingsPanel from "../components/settings/ShopSettingsPanel";

function Settings() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
          setIsEditing(false);
        }
      } catch (err) {
        if (!ignore) {
          const status = err.response?.status;
          const detail = err.response?.data?.detail;

          if (status === 404 && detail?.includes("no shop configured")) {
            setIsFirstTime(true);
            setShop(null);
            setError(null);
            setIsEditing(false);
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

  if (loading) {
    return <div>Loading settings…</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Settings</h2>
        <p style={{ color: "crimson" }}>Error: {error}</p>
      </div>
    );
  }

  const showWizard = isFirstTime || isEditing;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Settings</h2>
      <p
        style={{
          margin: "0.25rem 0 1rem",
          fontSize: "0.9rem",
          color: "#6b7280",
        }}
      >
        Configure your shop, defaults, and system behavior.
      </p>

      {showWizard ? (
        <ShopSetupWizard
          shop={isEditing ? shop : null}
          onCompleted={(updatedShop) => {
            setShop(updatedShop);
            setIsFirstTime(false);
            setIsEditing(false);
          }}
        />
      ) : (
        <ShopSettingsPanel
          shop={shop}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
}

export default Settings;
