// src/pages/Inventory.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchInventory } from "../api/inventory";

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function formatMoney(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return `$${Number(amount).toFixed(2)}`;
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // active/all if you expose that later
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load inventory
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchInventory();
        const items =
          Array.isArray(data) ?
            data :
            Array.isArray(data?.results) ?
              data.results :
              [];

        if (!cancelled) {
          setItems(items);
          setFiltered(items);
        }
      } catch (err) {
        console.error("fetchInventory error:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load inventory");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtering / search
  useEffect(() => {
    let list = [...items];

    if (search.trim()) {
      const term = search.toLowerCase();

      list = list.filter((item) => {
        const haystack = [
          item.name,
          item.sku,
          item.template_name,
          item.product_name,
          item.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(term);
      });
    }

    if (statusFilter !== "all") {
      // if backend exposes something like is_active, status, etc.
      if (statusFilter === "active") {
        list = list.filter((item) => item.is_active !== false);
      } else if (statusFilter === "inactive") {
        list = list.filter((item) => item.is_active === false);
      }
    }

    setFiltered(list);
  }, [items, search, statusFilter]);

  const list = Array.isArray(filtered) ? filtered : [];

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Inventory</h1>
          <p>Track what you have on hand, what’s reserved, and what’s free to sell.</p>
        </div>
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Inventory</h1>
          <p>Track what you have on hand, what’s reserved, and what’s free to sell.</p>
        </div>
        <p className="text-error">{error}</p>
        <button onClick={() => window.location.reload()} className="btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Inventory</h1>
        <p>Snapshot of your materials, components, and finished goods.</p>
      </div>

      {/* Filters */}
      <div
        className="settings-card"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input
            placeholder="Search by name, SKU, template, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "0.4rem 0.6rem",
              fontSize: "0.9rem",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "0.4rem 0.6rem",
              fontSize: "0.9rem",
              backgroundColor: "#fff",
            }}
          >
            <option value="all">All items</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive / archived</option>
          </select>
          <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
            {list.length} shown
          </span>
        </div>

        {/* Future: “New inventory item” button once you’re ready for a modal */}
        {/* <button className="btn" onClick={() => setShowNewModal(true)}>
          + New item
        </button> */}
      </div>

      {/* Table */}
      <div className="settings-card" style={{ padding: 0 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f3f4f6",
                textAlign: "left",
                color: "#374151",
              }}
            >
              {[
                "Item",
                "SKU",
                "Template / Product",
                "On hand",
                "Reserved",
                "Available",
                "Unit cost",
                "Location",
                "Updated",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "0.65rem 0.75rem",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    padding: "1.2rem",
                    color: "#6b7280",
                  }}
                >
                  No inventory items yet.
                </td>
              </tr>
            )}

            {list.map((item) => {
              // Be defensive about field names so you can adapt the serializer
              const name =
                item.name ||
                item.display_name ||
                item.product_name ||
                `Item #${item.id}`;
              const templateName =
                item.template_name || item.product_template || "—";
              const sku = item.sku || item.code || "—";
              const qtyOnHand =
                item.quantity_on_hand ??
                item.on_hand ??
                item.stock_on_hand ??
                null;
              const qtyReserved =
                item.quantity_reserved ??
                item.reserved ??
                item.stock_reserved ??
                null;
              const qtyAvailable =
                item.quantity_available ??
                item.available ??
                (qtyOnHand != null && qtyReserved != null
                  ? qtyOnHand - qtyReserved
                  : null);
              const unitCost =
                item.unit_cost ??
                item.cost_per_unit ??
                item.average_cost ??
                null;

              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    <Link to={`/inventory/${item.id}`}>{name}</Link>
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>{sku}</td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>{templateName}</td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    {qtyOnHand != null ? qtyOnHand : "—"}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    {qtyReserved != null ? qtyReserved : "—"}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    {qtyAvailable != null ? qtyAvailable : "—"}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem 0.75rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {unitCost != null ? formatMoney(unitCost) : "—"}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    {item.location || item.bin || "—"}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    {formatDate(item.updated_at || item.modified_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Future: NewInventoryItemModal goes here */}
    </div>
  );
}
