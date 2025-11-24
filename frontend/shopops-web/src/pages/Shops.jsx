// src/pages/Shops.jsx
import { useEffect, useState } from "react";
import { fetchCurrentShop } from "../api/shops";
import ShopCard from "../components/shops/ShopCard";

function Shops() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadShop() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCurrentShop();
        if (!ignore) {
          setShop(data);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Shop API error:", {
            url: err.config?.url,
            status: err.response?.status,
            data: err.response?.data,
          });
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
  }, []);

  const handleNewShop = () => {
    // In MVP, there's only one shop per user, so this is more like
    // "configure your shop" than "create another shop".
    console.log("New/configure shop clicked (not implemented yet)");
  };

  if (loading) {
    return <div>Loading shop…</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Shops</h2>
        <p style={{ color: "crimson" }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Shop</h2>
          <p
            style={{
              margin: "0.25rem 0 0",
              fontSize: "0.85rem",
              color: "#6b7280",
            }}
          >
            Your primary woodworking shop configuration.
          </p>
        </div>

        <button
          type="button"
          onClick={handleNewShop}
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#2563eb",
            color: "#ffffff",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Configure shop
        </button>
      </div>

      {shop ? (
        <div
          style={{
            maxWidth: "640px",
          }}
        >
          <ShopCard shop={shop} />
        </div>
      ) : (
        <p>No shop configured for your user yet.</p>
      )}
    </div>
  );
}

export default Shops;
