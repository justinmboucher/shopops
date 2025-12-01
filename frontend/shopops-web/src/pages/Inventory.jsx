// src/pages/Inventory.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  fetchMaterials,
  fetchConsumables,
  fetchEquipment,
} from "../api/inventory";

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function formatMoney(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return `$${Number(amount).toFixed(2)}`;
}

const TYPE_CONFIG = {
  materials: {
    title: "Materials",
    blurb:
      "Core stuff that becomes part of the finished work — lumber, fabric, resin blanks, sheet metal, clay, filament, etc.",
  },
  consumables: {
    title: "Consumables",
    blurb:
      "Supplies that get used up while you work — sandpaper, finishes, glue, resin, thread, blades, printer nozzles, etc.",
  },
  equipment: {
    title: "Equipment",
    blurb:
      "Tools and machines that do the work — saws, lathes, sewing machines, printers, CNC, presses, and other durable gear.",
  },
};

export default function Inventory() {
  const location = useLocation();

  // Decide which type we're viewing based on the URL
  let mode = "materials";
  if (location.pathname.includes("/inventory/consumables")) {
    mode = "consumables";
  } else if (location.pathname.includes("/inventory/equipment")) {
    mode = "equipment";
  } else {
    mode = "materials"; // default for /inventory and /inventory/materials
  }

  const { title, blurb } = TYPE_CONFIG[mode];

  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load inventory for current mode
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        let fetchFn = fetchMaterials;
        if (mode === "consumables") fetchFn = fetchConsumables;
        if (mode === "equipment") fetchFn = fetchEquipment;

        const data = await fetchFn();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];

        if (!cancelled) {
          setItems(items);
          setFiltered(items);
        }
      } catch (err) {
        console.error("inventory load error:", err);
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
  }, [mode]); // re-run when URL switches between materials / consumables / equipment

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
          <h1>{title}</h1>
          <p>{blurb}</p>
        </div>
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>{title}</h1>
          <p>{blurb}</p>
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
        <h1>{title}</h1>
        <p>{blurb}</p>
      </div>

      {/* Filters */}
      <div
        className="settings-card"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
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
              minWidth: "220px",
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
      </div>

      {/* Table */}
      <div className="settings-card settings-card--table">
        <table className="table table-striped">
          <thead>
            <tr>
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
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={9} className="table-empty-row">
                  No {title.toLowerCase()} yet.
                </td>
              </tr>
            )}

            {list.map((item) => {
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
                item.unit_cost ?? item.cost_per_unit ?? item.average_cost ?? null;

              return (
                <tr key={item.id}>
                  <td>{name}</td>
                  <td>{sku}</td>
                  <td>{templateName}</td>
                  <td>{qtyOnHand != null ? qtyOnHand : "—"}</td>
                  <td>{qtyReserved != null ? qtyReserved : "—"}</td>
                  <td>{qtyAvailable != null ? qtyAvailable : "—"}</td>
                  <td>{unitCost != null ? formatMoney(unitCost) : "—"}</td>
                  <td>{item.location || item.bin || "—"}</td>
                  <td>{formatDate(item.updated_at || item.modified_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
