// src/pages/CustomerDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCustomer, updateCustomer } from "../api/customers";
import { useToast } from "../context/useToast";

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

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function isValidEmail(value) {
  if (!value) return true; // allow blank
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value);
}

function normalizePhoneDigits(value) {
  return (value || "").replace(/\D/g, "");
}

function formatPhoneMask(digits) {
  const d = (digits || "").slice(0, 10);
  if (!d) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    (parts[0].charAt(0) || "").toUpperCase() +
    (parts[1].charAt(0) || "").toUpperCase()
  );
}

/** Edit modal */
function EditCustomerModal({ open, customer, onClose, onSaved }) {
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // masked
  const [channel, setChannel] = useState("");
  const [notes, setNotes] = useState("");
  const [isVip, setIsVip] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open || !customer) return;

    setName(customer.name || "");
    setEmail(customer.email || "");
    setPhone(formatPhoneMask(normalizePhoneDigits(customer.phone || "")));
    setChannel(customer.channel || "");
    setNotes(customer.notes || "");
    setIsVip(!!customer.is_vip);
    setIsActive(customer.is_active !== false);

    setAddressLine1(customer.address_line1 || "");
    setAddressLine2(customer.address_line2 || "");
    setCity(customer.city || "");
    setStateRegion(customer.state || "");
    setPostalCode(customer.postal_code || "");
    setCountry(customer.country || "");

    setSaving(false);
    setError(null);
    setFieldErrors({});
  }, [open, customer]);

  if (!open || !customer) return null;

  const errorText = (field) =>
    Array.isArray(fieldErrors[field]) ? fieldErrors[field].join(" ") : null;

  function validate() {
    const errors = {};

    if (!name.trim()) {
      errors.name = ["Name is required."];
    }
    if (!isValidEmail(email)) {
      errors.email = ["Enter a valid email address."];
    }

    const phoneDigits = normalizePhoneDigits(phone);
    if (phoneDigits && phoneDigits.length !== 10) {
      errors.phone = ["Enter a 10-digit phone number or leave blank."];
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("Please fix the highlighted fields.");
      return false;
    }

    setError(null);
    return true;
  }

  function handlePhoneChange(e) {
    const digits = normalizePhoneDigits(e.target.value);
    setPhone(formatPhoneMask(digits));
  }

  async function handleSave() {
    setSaving(true);
    setFieldErrors({});
    setError(null);

    try {
      if (!validate()) {
        showToast({
          type: "error",
          message: "Fix the highlighted fields before saving.",
        });
        return;
      }

      const payload = {
        name,
        email,
        phone,
        channel,
        notes,
        is_vip: isVip,
        is_active: isActive,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state: stateRegion,
        postal_code: postalCode,
        country,
      };

      const updated = await updateCustomer(customer.id, payload);

      showToast({
        type: "success",
        message: "Customer changes saved.",
      });

      onSaved?.(updated);
      onClose();
    } catch (err) {
      console.error("updateCustomer error:", err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setFieldErrors(data);
        setError(
          data.detail || "Please fix the highlighted fields and try again."
        );
      } else {
        setError("Failed to save customer.");
      }

      showToast({
        type: "error",
        message: "Could not save customer. Check the form and try again.",
      });
    } finally {
      setSaving(false);
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
        zIndex: 60,
      }}
      onClick={onClose}
    >
      <div
        className="settings-card"
        style={{
          maxWidth: "640px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Edit customer</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
            disabled={saving}
          >
            ×
          </button>
        </div>

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
          style={{
            display: "grid",
            gap: "0.9rem",
          }}
        >
          {/* Name */}
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

          {/* Email + phone */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "180px" }}>
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

            <div style={{ flex: 1, minWidth: "180px" }}>
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
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
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

          {/* Channel */}
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

          {/* Address */}
          <div>
            <label
              style={{
                fontSize: "0.8rem",
                display: "block",
                marginBottom: 4,
              }}
            >
              Address line 1
            </label>
            <input
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Street address, P.O. box"
              style={{
                width: "100%",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                padding: "0.4rem 0.6rem",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "0.8rem",
                display: "block",
                marginBottom: 4,
              }}
            >
              Address line 2
            </label>
            <input
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Apartment, suite, unit, etc."
              style={{
                width: "100%",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                padding: "0.4rem 0.6rem",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "140px" }}>
              <label
                style={{
                  fontSize: "0.8rem",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                City
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: "120px" }}>
              <label
                style={{
                  fontSize: "0.8rem",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                State / Region
              </label>
              <input
                value={stateRegion}
                onChange={(e) => setStateRegion(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: "120px" }}>
              <label
                style={{
                  fontSize: "0.8rem",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Postal code
              </label>
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: "160px" }}>
              <label
                style={{
                  fontSize: "0.8rem",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Country
              </label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          </div>

          {/* Notes */}
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
              rows={4}
              placeholder="Preferences, sizing, what they usually buy, important context…"
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

          {/* Flags */}
          <div
            style={{
              display: "flex",
              gap: "2rem",
              marginTop: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
              }}
            >
              <input
                type="checkbox"
                checked={isVip}
                onChange={(e) => setIsVip(e.target.checked)}
              />
              Mark as VIP customer
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
              }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active customer
            </label>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              marginTop: "1rem",
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
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Main detail page */
export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchCustomer(id);
        if (cancelled) return;
        setCustomer(data);
      } catch (err) {
        console.error("fetchCustomer error:", err);
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              err.message ||
              "Failed to load customer"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Customer</h1>
        <p>Loading…</p>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="page">
        <h1 className="page-title">Customer</h1>
        <p className="text-error">{error}</p>
        <button className="btn" onClick={() => navigate("/customers")}>
          Back to customers
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="page">
        <h1 className="page-title">Customer</h1>
        <p>Customer not found.</p>
      </div>
    );
  }

  const totalProjects = customer.total_projects ?? 0;
  const totalProducts = customer.total_products ?? 0;
  const tenureLabel = formatTenure(customer.tenure_days);

  const addressLines = [
    customer.address_line1,
    customer.address_line2,
    [customer.city, customer.state, customer.postal_code]
      .filter(Boolean)
      .join(", "),
    customer.country,
  ].filter((line) => line && line.trim());

  return (
    <div className="page">
      {/* Header with edit button */}
      <div className="page-header" style={{ marginBottom: "1rem" }}>
        <div>
          <h1>
            {customer.name || "Unnamed customer"}
            {customer.is_vip && (
              <span
                style={{
                  marginLeft: "0.5rem",
                  padding: "0.15rem 0.55rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  background: "#fef3c7",
                  color: "#92400e",
                  border: "1px solid #fde68a",
                }}
              >
                VIP
              </span>
            )}
          </h1>
          <p>
            Overview of this customer and their contact details. Edit in the
            modal to keep things tidy.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/customers")}
            style={{
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              padding: "0.35rem 0.9rem",
              fontSize: "0.9rem",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="btn"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Metrics summary card */}
      <div
        className="settings-card"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#6b7280",
              marginBottom: "0.15rem",
            }}
          >
            Projects
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
            {totalProjects}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#6b7280",
              marginBottom: "0.15rem",
            }}
          >
            Products
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
            {totalProducts}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#6b7280",
              marginBottom: "0.15rem",
            }}
          >
            Tenure
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
            {tenureLabel}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            Since {formatDate(customer.created_at)}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#6b7280",
              marginBottom: "0.15rem",
            }}
          >
            Status
          </div>
          <div
            style={{
              padding: "0.2rem 0.7rem",
              borderRadius: "999px",
              display: "inline-block",
              fontSize: "0.8rem",
              background: customer.is_active ? "#d1fae5" : "#e5e7eb",
              color: customer.is_active ? "#065f46" : "#4b5563",
            }}
          >
            {customer.is_active ? "Active" : "Inactive"}
          </div>
        </div>
      </div>

      {/* Two main cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.2fr)",
          gap: "1.5rem",
          alignItems: "flex-start",
        }}
      >
        {/* Card 1: avatar + contact + shipping */}
        <div className="settings-card">
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "999px",
                background: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "1.2rem",
                color: "#374151",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {customer.avatar ? (
                <img
                  src={customer.avatar}
                  alt={customer.name || "Customer avatar"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                getInitials(customer.name)
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: "0.15rem",
                }}
              >
                {customer.name || "Unnamed customer"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Customer since {formatDate(customer.created_at)}
              </div>
              {customer.channel && (
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  Source: {customer.channel}
                </div>
              )}
            </div>
          </div>

          <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.35rem",
              }}
            >
              Contact
            </div>
            <div style={{ marginBottom: "0.25rem" }}>
              <span style={{ fontWeight: 500 }}>Email: </span>
              <span>{customer.email || "—"}</span>
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <span style={{ fontWeight: 500 }}>Phone: </span>
              <span>{customer.phone || "—"}</span>
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.35rem",
              }}
            >
              Shipping address
            </div>
            {addressLines.length === 0 ? (
              <div>—</div>
            ) : (
              <div style={{ whiteSpace: "pre-line" }}>
                {addressLines.join("\n")}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: notes */}
        <div className="settings-card">
          <div
            style={{
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#6b7280",
                marginBottom: "0.25rem",
              }}
            >
              Notes
            </div>
            <div
              style={{
                fontSize: "0.9rem",
                whiteSpace: "pre-wrap",
                minHeight: "2.5rem",
              }}
            >
              {customer.notes || (
                <span style={{ color: "#9ca3af" }}>
                  No notes yet. Add preferences, history, or reminders in the
                  editor.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <EditCustomerModal
        open={showEditModal}
        customer={customer}
        onClose={() => setShowEditModal(false)}
        onSaved={(updated) => setCustomer(updated)}
      />
    </div>
  );
}
