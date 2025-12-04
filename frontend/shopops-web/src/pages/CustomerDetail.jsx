// src/pages/CustomerDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";

import { fetchCustomer, updateCustomer } from "../api/customers";
import { fetchProjects } from "../api/projects";
import { useToast } from "../context/useToast";

import Modal from "../components/common/Modal";
import Avatar from "../components/common/Avatar";
import MetricCard from "../components/dashboard/MetricCard";

import "../styles/customers.css";

/* ----------------- Generic helpers ----------------- */

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

function formatPhoneMask(raw) {
  const digits = normalizePhoneDigits(raw).slice(0, 10);
  if (!digits) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n === 0) return "—";
  return currencyFormatter.format(n);
}

/* ----------------- Channel + status chips ----------------- */

function getChannelClass(channelRaw) {
  const value = (channelRaw || "").trim().toLowerCase();
  const base = "badge badge--channel";

  if (!value) return `${base} badge--channel-neutral`;
  if (value.includes("etsy")) return `${base} badge--channel-etsy`;
  if (value === "ig" || value.includes("instagram"))
    return `${base} badge--channel-instagram`;
  if (value.includes("craft")) return `${base} badge--channel-craftfair`;
  if (value.includes("ref") || value.includes("word-of-mouth"))
    return `${base} badge--channel-referral`;
  return `${base} badge--channel-neutral`;
}

function getStatusClass(statusRaw) {
  const value = (statusRaw || "").toLowerCase();

  if (value === "new inquiry" || value === "new") {
    return "badge--status badge--status-new";
  }
  if (value === "in progress" || value === "wip" || value === "active") {
    return "badge--status badge--status-inprogress";
  }
  if (value.includes("waiting")) {
    return "badge--status badge--status-waiting";
  }
  if (value === "completed" || value === "done") {
    return "badge--status badge--status-completed";
  }
  if (value === "archived" || value === "canceled" || value === "cancelled") {
    return "badge--status badge--status-archived";
  }
  return "badge--status badge--status-archived";
}

/* ----------------- Process bar helpers ----------------- */

function getProjectProgress(project) {
  const status = (project.status || "").toLowerCase();

  const totalRaw = project.total_stages ?? 0;
  const cancelOrder = project.cancel_stage_order ?? null;

  // If the cancel stage is the last stage, don't count it
  let effectiveTotal = totalRaw;
  if (cancelOrder && cancelOrder === totalRaw && totalRaw > 0) {
    effectiveTotal = totalRaw - 1;
  }

  // Completed / cancelled always show full bar
  if (status.includes("completed") || status === "done") {
    return 1;
  }
  if (status.includes("cancel")) {
    return 1;
  }

  const current = project.current_stage_order ?? 0;
  if (!effectiveTotal || !current) return 0;

  const fraction = current / effectiveTotal;
  return Math.max(0, Math.min(1, fraction));
}

function getProcessColor(statusRaw, progress) {
  const status = (statusRaw || "").toLowerCase();

  if (status.includes("cancel")) return "#ef4444"; // red
  if (progress <= 0.2) return "#3b82f6"; // blue
  if (progress <= 0.5) return "#6366f1"; // indigo
  if (progress <= 0.8) return "#06b6d4"; // cyan
  return "#16a34a"; // green
}

/* ----------------- Analytics helpers ----------------- */

function computeCustomerAnalytics(customer) {
  const totalSales = customer.total_sales ?? 0;
  const lifetimeRevenue = Number(customer.lifetime_revenue ?? 0);
  const completed = customer.completed_projects ?? 0;
  const ordersThisYear = customer.orders_this_year ?? 0;

  const completionRate =
    totalSales > 0 ? (completed / totalSales) * 100 : null;

  const avgOrderValue =
    totalSales > 0 && lifetimeRevenue ? lifetimeRevenue / totalSales : null;

  return {
    totalSales,
    lifetimeRevenue,
    avgOrderValue,
    completionRate,
    ordersThisYear,
  };
}

/* ----------------- Edit modal ----------------- */

function EditCustomerModal({ open, customer, onClose, onSaved }) {
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
    setPhone(formatPhoneMask(customer.phone || ""));
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
    setPhone(formatPhoneMask(e.target.value));
  }

  async function handleSave(e) {
    e?.preventDefault();
    if (!validate()) {
      showToast({
        type: "error",
        message: "Fix the highlighted fields before saving.",
      });
      return;
    }

    setSaving(true);
    setFieldErrors({});
    setError(null);

    try {
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

      showToast({ type: "success", message: "Customer changes saved." });
      onSaved?.(updated);
      onClose();
    } catch (err) {
      console.error("updateCustomer error:", err);
      const data = err.response?.data;

      if (data && typeof data === "object") {
        setFieldErrors(data);
        setError(
          data.detail || "Please fix the highlighted fields and try again.",
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

  const footer = (
    <>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={onClose}
        disabled={saving}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="edit-customer-form"
        className="btn btn-primary"
        disabled={saving}
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit customer"
      size="md"
      footer={footer}
    >
      {error && (
        <p className="text-error" style={{ marginBottom: "0.75rem" }}>
          {error}
        </p>
      )}

      <form
        id="edit-customer-form"
        onSubmit={handleSave}
        className="form-grid"
      >
        <div className="form-field form-field--full">
          <label className="form-label">
            Name<span style={{ color: "#f97316" }}> *</span>
          </label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errorText("name") && (
            <p className="text-error">{errorText("name")}</p>
          )}
        </div>

        <div className="form-field">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
          {errorText("email") && (
            <p className="text-error">{errorText("email")}</p>
          )}
        </div>

        <div className="form-field">
          <label className="form-label">Phone</label>
          <input
            className="form-input"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(555) 123-4567"
          />
          {errorText("phone") && (
            <p className="text-error">{errorText("phone")}</p>
          )}
        </div>

        <div className="form-field form-field--full">
          <label className="form-label">Channel</label>
          <input
            className="form-input"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            placeholder="Etsy, craft fair, Instagram, referral…"
          />
          {errorText("channel") && (
            <p className="text-error">{errorText("channel")}</p>
          )}
        </div>

        <div className="form-field form-field--full">
          <label className="form-label">Address line 1</label>
          <input
            className="form-input"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="Street address, P.O. box"
          />
          {errorText("address_line1") && (
            <p className="text-error">{errorText("address_line1")}</p>
          )}
        </div>

        <div className="form-field form-field--full">
          <label className="form-label">Address line 2</label>
          <input
            className="form-input"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Apartment, suite, unit, etc."
          />
          {errorText("address_line2") && (
            <p className="text-error">{errorText("address_line2")}</p>
          )}
        </div>

        <div className="form-field">
          <label className="form-label">City</label>
          <input
            className="form-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          {errorText("city") && (
            <p className="text-error">{errorText("city")}</p>
          )}
        </div>

        <div className="form-field">
          <label className="form-label">State / Region</label>
          <input
            className="form-input"
            value={stateRegion}
            onChange={(e) => setStateRegion(e.target.value)}
          />
          {errorText("state") && (
            <p className="text-error">{errorText("state")}</p>
          )}
        </div>

        <div className="form-field">
          <label className="form-label">Postal code</label>
          <input
            className="form-input"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
          {errorText("postal_code") && (
            <p className="text-error">{errorText("postal_code")}</p>
          )}
        </div>

        <div className="form-field form-field--full">
          <label className="form-label">Country</label>
          <input
            className="form-input"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          {errorText("country") && (
            <p className="text-error">{errorText("country")}</p>
          )}
        </div>

        <div className="form-field form-field--full">
          <label className="form-label">Notes</label>
          <textarea
            className="form-input"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Preferences, sizing, what they usually buy, important context…"
            style={{ resize: "vertical" }}
          />
          {errorText("notes") && (
            <p className="text-error">{errorText("notes")}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}

/* ----------------- Main detail page ----------------- */

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  const [projectSort, setProjectSort] = useState({
    field: "created_at",
    direction: "desc",
  });

  // inline notes editor state (detail page)
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesError, setNotesError] = useState(null);

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
              "Failed to load customer",
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

  // Load projects for this customer
  useEffect(() => {
    if (!customer) return;

    let cancelled = false;

    async function loadProjects() {
      setProjectsLoading(true);
      setProjectsError(null);

      try {
        const data = await fetchProjects({ customer: customer.id });
        const items = data.results || data;
        if (!cancelled) {
          setProjects(items);
        }
      } catch (err) {
        console.error("fetchProjects (customer detail) error:", err);
        if (!cancelled) {
          setProjectsError("Failed to load projects for this customer.");
        }
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, [customer]);

  // keep notesDraft in sync when not editing
  useEffect(() => {
    if (customer && !isEditingNotes) {
      setNotesDraft(customer.notes || "");
      setNotesError(null);
    }
  }, [customer, isEditingNotes]);

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

  function getTenureDaysFromCustomer(c) {
    if (c.tenure_days != null) {
      const d = Number(c.tenure_days);
      if (!Number.isNaN(d) && d > 0) return d;
    }

    if (!c.created_at) return null;

    const created = new Date(c.created_at);
    if (Number.isNaN(created.getTime())) return null;

    const diffMs = Date.now() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays <= 0 ? 1 : diffDays;
  }

  const tenureDays = getTenureDaysFromCustomer(customer);
  const tenureLabel = tenureDays != null ? formatTenure(tenureDays) : "—";

  const addressLines = [
    customer.address_line1,
    customer.address_line2,
    [customer.city, customer.state, customer.postal_code]
      .filter(Boolean)
      .join(", "),
    customer.country,
  ].filter((line) => line && line.trim());

  const analytics = computeCustomerAnalytics(customer);

  const activityLines = [];
  if (customer.updated_at) {
    activityLines.push(
      `Last profile update: ${formatDate(customer.updated_at)}`,
    );
  }
  if (projects.length > 0) {
    const lastProject = projects[0]; // backend orders by -created_at
    activityLines.push(
      `Most recent project: ${lastProject.name || "Untitled"} (${formatDate(
        lastProject.created_at,
      )})`,
    );
  }

  function handleProjectSort(field) {
    setProjectSort((prev) => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { field, direction: "asc" };
    });
  }

  const sortedProjects = (() => {
    const items = [...projects];
    const { field, direction } = projectSort;
    const factor = direction === "asc" ? 1 : -1;

    items.sort((a, b) => {
      let av = a[field];
      let bv = b[field];

      if (
        field === "name" ||
        field === "status" ||
        field === "current_stage_name"
      ) {
        av = (av || "").toLowerCase();
        bv = (bv || "").toLowerCase();
        if (av < bv) return -1 * factor;
        if (av > bv) return 1 * factor;
        return 0;
      }

      const ad = av ? new Date(av).getTime() : 0;
      const bd = bv ? new Date(bv).getTime() : 0;

      return (ad - bd) * factor;
    });

    return items;
  })();

  // inline notes handlers
  function startEditNotes() {
    setIsEditingNotes(true);
    setNotesDraft(customer.notes || "");
    setNotesError(null);
  }

  function cancelEditNotes() {
    setIsEditingNotes(false);
    setNotesDraft(customer.notes || "");
    setNotesError(null);
  }

  async function saveNotes() {
    if (!customer) return;
    setNotesSaving(true);
    setNotesError(null);
    try {
      const updated = await updateCustomer(customer.id, {
        notes: notesDraft,
      });
      setCustomer(updated);
      setIsEditingNotes(false);
    } catch (err) {
      console.error("updateCustomer (notes) error:", err);
      setNotesError("Could not save notes. Please try again.");
    } finally {
      setNotesSaving(false);
    }
  }

  return (
    <div className="page">
      {/* Header with back link, avatar, name, and edit button */}
      <div className="customer-detail-header">
        <div className="customer-detail-header-left">
          <button
            type="button"
            className="btn-ghost-link customer-detail-back"
            onClick={() => navigate("/customers")}
          >
            <ArrowLeft size={16} />
            <span>Back to customers</span>
          </button>

          <div className="customer-header-main">
            <Avatar
              name={customer.name}
              imageUrl={customer.avatar}
              idForColor={customer.id}
              size="lg"
            />
            <div className="customer-header-text">
              <div className="customer-header-name-row">
                <h1 className="page-title">
                  {customer.name || "Unnamed customer"}
                </h1>
                {customer.is_vip && (
                  <span className="customer-vip-pill">VIP</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="btn btn-primary customer-detail-edit-btn"
        >
          <Pencil size={16} />
          <span>Edit customer</span>
        </button>
      </div>

      {/* Analytics row – 4 cards on one row */}
      <div className="customer-analytics-row">
        <MetricCard
          title="Lifetime revenue"
          value={formatCurrency(analytics.lifetimeRevenue)}
          timeframe={
            analytics.totalSales
              ? `${analytics.totalSales} sales`
              : "No sales yet"
          }
          variant="simple"
        />
        <MetricCard
          title="Avg order value"
          value={formatCurrency(analytics.avgOrderValue)}
          timeframe={
            analytics.totalSales ? "Across all sales" : "No sales yet"
          }
          variant="simple"
        />
        <MetricCard
          title="Completion rate"
          value={
            analytics.completionRate != null
              ? `${analytics.completionRate.toFixed(0)}%`
              : "—"
          }
          timeframe={
            analytics.totalSales
              ? `${customer.completed_projects ?? 0} completed projects`
              : ""
          }
          variant="simple"
        />
        <MetricCard
          title="Orders this year"
          value={analytics.ordersThisYear || 0}
          timeframe={
            analytics.totalSales
              ? `${analytics.totalSales} sales all-time`
              : "No sales yet"
          }
          variant="simple"
        />
      </div>

      {/* Summary metrics banner */}
      <div className="settings-card customer-summary-banner">
        <div className="summary-metric">
          <div className="summary-metric-label">Projects</div>
          <div className="summary-metric-value">{totalProjects}</div>
        </div>
        <div className="summary-metric">
          <div className="summary-metric-label">Products</div>
          <div className="summary-metric-value">{totalProducts}</div>
        </div>
        <div className="summary-metric">
          <div className="summary-metric-label">Tenure</div>
          <div className="summary-metric-value">{tenureLabel}</div>
          <div className="summary-metric-sub">
            Since {formatDate(customer.created_at)}
          </div>
        </div>
        <div className="summary-metric">
          <div className="summary-metric-label">Status</div>
          <div
            className={
              customer.is_active
                ? "status-pill status-pill--active"
                : "status-pill status-pill--inactive"
            }
          >
            {customer.is_active ? "Active" : "Inactive"}
          </div>
        </div>
      </div>

      {/* Main details grid: contact + notes */}
      <div className="customer-detail-main-grid">
        {/* Contact card */}
        <div className="settings-card customer-contact-card">
          <div className="customer-contact-header">
            <div className="customer-contact-primary">
              <div className="customer-contact-name">
                Contact Details
              </div>
              
              <div className="customer-contact-meta">
                <div className="customer-contact-since">Customer since {formatDate(customer.created_at)}</div>

                {customer.channel && (
                  <div className="customer-contact-channel">
                    <span className="customer-contact-channel-label">
                      Source:
                    </span>
                    <span className={getChannelClass(customer.channel)}>
                      {customer.channel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="customer-contact-body">
            <div className="customer-contact-section">
              <div className="customer-section-label">Contact Info</div>
              <div className="customer-contact-row">
                <span className="customer-contact-key">Email</span>
                <span className="customer-contact-value">
                  {customer.email || "—"}
                </span>
              </div>
              <div className="customer-contact-row">
                <span className="customer-contact-key">Phone</span>
                <span className="customer-contact-value">
                  {formatPhoneMask(customer.phone) || "—"}
                </span>
              </div>
            </div>

            <div className="customer-contact-section">
              <div className="customer-section-label">Shipping address</div>
              {addressLines.length === 0 ? (
                <div className="customer-address-empty">—</div>
              ) : (
                <div className="customer-address">
                  {addressLines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes card */}
        <div className="settings-card customer-notes-card">
          <div className="customer-notes-header">
            <div className="customer-section-label">Notes</div>
            <button
              type="button"
              className="icon-button notes-edit-btn"
              onClick={startEditNotes}
              title={isEditingNotes ? "Editing notes" : "Edit notes"}
            >
              <Pencil size={14} />
            </button>
          </div>

          {notesError && <p className="text-error">{notesError}</p>}

          <div
            className="customer-notes-body"
            onDoubleClick={startEditNotes}
            title="Double-click to edit notes"
          >
            {isEditingNotes ? (
              <>
                <textarea
                  className="form-input customer-notes-textarea"
                  rows={5}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Preferences, history, reminders…"
                />
                <div className="customer-notes-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={cancelEditNotes}
                    disabled={notesSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={saveNotes}
                    disabled={notesSaving}
                  >
                    {notesSaving ? "Saving…" : "Save notes"}
                  </button>
                </div>
              </>
            ) : customer.notes ? (
              <pre className="customer-notes-text">{customer.notes}</pre>
            ) : (
              <span className="customer-notes-empty">
                No notes yet. Double-click to add some context.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Orders / projects table */}
      <div className="settings-card customer-orders-card">
        <div className="customer-orders-header">
          <h2 className="customer-orders-title">Orders & projects</h2>
        </div>

        {projectsLoading ? (
          <p>Loading projects…</p>
        ) : projectsError ? (
          <p className="text-error">{projectsError}</p>
        ) : projects.length === 0 ? (
          <p className="customer-orders-empty">
            No projects or orders yet for this customer.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th
                    className={`sortable-header ${
                      projectSort.field === "name"
                        ? `is-${projectSort.direction}`
                        : ""
                    }`}
                    onClick={() => handleProjectSort("name")}
                  >
                    Project
                  </th>
                  <th
                    className={`sortable-header ${
                      projectSort.field === "created_at"
                        ? `is-${projectSort.direction}`
                        : ""
                    }`}
                    onClick={() => handleProjectSort("created_at")}
                  >
                    Ordered
                  </th>
                  <th>Process</th>
                  <th
                    className={`sortable-header ${
                      projectSort.field === "current_stage_name"
                        ? `is-${projectSort.direction}`
                        : ""
                    }`}
                    onClick={() => handleProjectSort("current_stage_name")}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedProjects.map((project) => {
                  const progress = getProjectProgress(project);
                  const progressPct = Math.round(progress * 100);
                  const color = getProcessColor(project.status, progress);

                  const totalStagesRaw = project.total_stages ?? null;
                  const cancelOrder = project.cancel_stage_order ?? null;

                  let effectiveTotal = totalStagesRaw;
                  if (
                    cancelOrder &&
                    cancelOrder === totalStagesRaw &&
                    totalStagesRaw > 0
                  ) {
                    effectiveTotal = totalStagesRaw - 1;
                  }

                  const currentStageOrder = project.current_stage_order ?? null;

                  const progressLabel =
                    effectiveTotal && currentStageOrder
                      ? `Stage ${currentStageOrder} of ${effectiveTotal} (${progressPct}%)`
                      : `${progressPct}% complete`;

                  const statusRaw = (project.status || "").toLowerCase();
                  const isCompleted =
                    statusRaw.includes("completed") || statusRaw === "done";
                  const isCancelled = statusRaw.includes("cancel");

                  const statusLabel = isCancelled
                    ? "Cancelled"
                    : isCompleted
                    ? "Completed"
                    : project.current_stage_name || "Active";

                  return (
                    <tr key={project.id}>
                      <td>
                        <div className="customer-order-name">
                          {project.name || "Untitled project"}
                        </div>
                        {project.template_name && (
                          <div className="customer-order-ref">
                            {project.template_name}
                          </div>
                        )}
                      </td>
                      <td>
                        {project.created_at ? formatDate(project.created_at) : "—"}
                      </td>
                      <td>
                        <div className="process-pill">
                          <div
                            className="process-pill__inner"
                            style={{
                              width: `${progressPct}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <div className="process-pill__label">
                          {progressLabel}
                        </div>
                      </td>
                      <td>
                        <span className={getStatusClass(project.status)}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent activity card (bottom) */}
      <div className="settings-card customer-activity-card">
        <h2 className="customer-orders-title">Recent activity</h2>
        {activityLines.length === 0 ? (
          <p className="customer-orders-empty">
            No recent activity recorded for this customer yet.
          </p>
        ) : (
          <ul className="customer-activity-list">
            {activityLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
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
