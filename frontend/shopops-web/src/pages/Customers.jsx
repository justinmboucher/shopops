// src/pages/Customers.jsx
import React, { useEffect, useState } from "react";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
} from "../api/customers";
import { Link } from "react-router-dom";

function formatTenure(days) {
  if (days == null || isNaN(Number(days))) return "—";
  const d = Number(days);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"}`;
  const months = d / 30;
  if (months < 12) {
    const m = Math.round(months * 10) / 10;
    return `${m} mo`;
  }
  const years = d / 365;
  const y = Math.round(years * 10) / 10;
  return `${y} yr`;
}

function NewCustomerModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("");
  const [notes, setNotes] = useState("");
  const [isVip, setIsVip] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setPhone("");
      setChannel("");
      setNotes("");
      setIsVip(false);
      setLoading(false);
      setError(null);
      setFieldErrors({});
    }
  }, [open]);

  if (!open) return null;

  const errorText = (field) =>
    Array.isArray(fieldErrors[field]) ? fieldErrors[field].join(" ") : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const payload = {
        name,
        email,
        phone,
        channel,
        notes,
        is_vip: isVip,
        // is_active defaults to true on the backend
      };

      const created = await createCustomer(payload);
      onCreated?.(created);
      onClose();
    } catch (err) {
      console.error("createCustomer error:", err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setFieldErrors(data);
        setError("Please fix the highlighted fields.");
      } else {
        setError("Failed to create customer.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        className="settings-card"
        style={{
          maxWidth: "520px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>New Customer</h2>
            <button
              type="button"
              onClick={onClose}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
              disabled={loading}
            >
              ×
            </button>
          </div>

          <p
            style={{
              marginTop: 0,
              marginBottom: "0.75rem",
              fontSize: "0.85rem",
              color: "#6b7280",
            }}
          >
            Add a new customer so you can attach projects and sales to them.
          </p>

          {error && (
            <div
              style={{
                marginBottom: "0.75rem",
                fontSize: "0.85rem",
                color: "#b91c1c",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: "0.75rem" }}
          >
            <div>
              <label
                style={{
                  fontSize: "0.8rem",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                }}
              />
              {errorText("name") && (
                <p
                  style={{
                    margin: "0.15rem 0 0",
                    fontSize: "0.75rem",
                    color: "#b91c1c",
                  }}
                >
                  {errorText("name")}
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: "0.8rem",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    padding: "0.4rem 0.6rem",
                    fontSize: "0.9rem",
                  }}
                />
                {errorText("email") && (
                  <p
                    style={{
                      margin: "0.15rem 0 0",
                      fontSize: "0.75rem",
                      color: "#b91c1c",
                    }}
                  >
                    {errorText("email")}
                  </p>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: "0.8rem",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Phone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    padding: "0.4rem 0.6rem",
                    fontSize: "0.9rem",
                  }}
                />
                {errorText("phone") && (
                  <p
                    style={{
                      margin: "0.15rem 0 0",
                      fontSize: "0.75rem",
                      color: "#b91c1c",
                    }}
                  >
                    {errorText("phone")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.8rem",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Channel
              </label>
              <input
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="Etsy, craft fair, Instagram, referral…"
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                }}
              />
              {errorText("channel") && (
                <p
                  style={{
                    margin: "0.15rem 0 0",
                    fontSize: "0.75rem",
                    color: "#b91c1c",
                  }}
                >
                  {errorText("channel")}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.8rem",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Preferences, sizes, what they usually buy…"
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                  resize: "vertical",
                }}
              />
              {errorText("notes") && (
                <p
                  style={{
                    margin: "0.15rem 0 0",
                    fontSize: "0.75rem",
                    color: "#b91c1c",
                  }}
                >
                  {errorText("notes")}
                </p>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "0.25rem",
              }}
            >
              <input
                id="new-customer-vip"
                type="checkbox"
                checked={isVip}
                onChange={(e) => setIsVip(e.target.checked)}
              />
              <label
                htmlFor="new-customer-vip"
                style={{ fontSize: "0.85rem", color: "#374151" }}
              >
                Mark as VIP customer
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
                marginTop: "0.75rem",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  padding: "0.45rem 0.9rem",
                  fontSize: "0.9rem",
                  background: "#ffffff",
                  cursor: "pointer",
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Saving…" : "Add customer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active"); // active/all/inactive
  const [vipFilter, setVipFilter] = useState("all"); // all/yes/no

  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCustomers();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];

        if (!cancelled) {
          setCustomers(items);
          setFiltered(items);
        }
      } catch (err) {
        console.error("fetchCustomers error:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load customers");
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

  useEffect(() => {
    let list = [...customers];

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter((c) => {
        const haystack = [
          c.name,
          c.email,
          c.phone,
          c.channel,
          c.is_vip ? "vip" : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(term);
      });
    }

    if (statusFilter !== "all") {
      const active = statusFilter === "active";
      list = list.filter((c) => !!c.is_active === active);
    }

    if (vipFilter !== "all") {
      const wantVip = vipFilter === "yes";
      list = list.filter((c) => !!c.is_vip === wantVip);
    }

    setFiltered(list);
  }, [customers, search, statusFilter, vipFilter]);

  const list = Array.isArray(filtered) ? filtered : [];

  async function handleToggleVip(customer) {
    try {
      const updated = await updateCustomer(customer.id, {
        is_vip: !customer.is_vip,
      });
      setCustomers((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (err) {
      console.error("toggle VIP error:", err);
      // optional: toast
    }
  }

  async function handleToggleActive(customer) {
    try {
      const updated = await updateCustomer(customer.id, {
        is_active: !customer.is_active,
      });
      setCustomers((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (err) {
      console.error("toggle active error:", err);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Customers</h1>
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1 className="page-title">Customers</h1>
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
        <h1>Customers</h1>
        <p>
          People who buy your work, with a quick view of how much history you
          have with them.
        </p>
      </div>

      {/* Filters + new button */}
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
            placeholder="Search by name, email, channel, or 'vip'…"
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
            <option value="active">Active only</option>
            <option value="all">All statuses</option>
            <option value="inactive">Inactive only</option>
          </select>

          <select
            value={vipFilter}
            onChange={(e) => setVipFilter(e.target.value)}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "0.4rem 0.6rem",
              fontSize: "0.9rem",
              backgroundColor: "#fff",
            }}
          >
            <option value="all">All customers</option>
            <option value="yes">VIP only</option>
            <option value="no">Non-VIP only</option>
          </select>

          <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
            {list.length} shown
          </span>
        </div>

        <button className="btn" onClick={() => setShowNewModal(true)}>
          + New Customer
        </button>
      </div>

      {/* Table */}
      <div className="settings-card settings-card--table">
        <table className="table table-striped">
          <thead>
            <tr>
              {[
                "Customer",
                "Contact",
                "Channel",
                "Projects",
                "Products",
                "Tenure",
                "VIP",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={9} className="table-empty-row">
                  No customers yet.
                </td>
              </tr>
            )}

            {list.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>
                    <Link to={`/customers/${c.id}`}>{c.name}</Link>
                  </div>
                  {c.notes && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        maxWidth: "260px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.notes}
                    </div>
                  )}
                </td>
                <td>
                  {c.email && (
                    <div style={{ fontSize: "0.8rem" }}>{c.email}</div>
                  )}
                  {c.phone && (
                    <div style={{ fontSize: "0.8rem", color: "#cbd5f5" }}>
                      {c.phone}
                    </div>
                  )}
                </td>
                <td>{c.channel || "—"}</td>
                <td>{c.total_projects ?? 0}</td>
                <td>{c.total_products ?? 0}</td>
                <td>{formatTenure(c.tenure_days)}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleToggleVip(c)}
                    style={{
                      borderRadius: "999px",
                      border: "1px solid #e5e7eb",
                      padding: "0.15rem 0.5rem",
                      fontSize: "0.75rem",
                      background: c.is_vip ? "#fef3c7" : "#111827",
                      cursor: "pointer",
                      color: c.is_vip ? "#92400e" : "#e5e7eb",
                    }}
                  >
                    {c.is_vip ? "VIP" : "Standard"}
                  </button>
                </td>
                <td>
                  <span
                    style={{
                      padding: "0.25rem 0.6rem",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      background: c.is_active ? "#d1fae5" : "#e5e7eb",
                      color: c.is_active ? "#065f46" : "#4b5563",
                    }}
                  >
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button
  type="button"
  onClick={() => handleToggleActive(c)}
  style={{
    borderRadius: "999px",
    padding: "0.2rem 0.65rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid",
    background: c.is_active ? "#fee2e2" : "#dbeafe",
    borderColor: c.is_active ? "#fecaca" : "#bfdbfe",
    color: c.is_active ? "#991b1b" : "#1e3a8a",
  }}
>
  {c.is_active ? "Archive" : "Unarchive"}
</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <NewCustomerModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={(created) => {
          setCustomers((prev) => [created, ...prev]);
        }}
      />
    </div>
  );
}
