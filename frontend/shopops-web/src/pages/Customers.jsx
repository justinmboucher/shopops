// src/pages/Customers.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Package, Search } from "lucide-react";

import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
} from "../api/customers";

import useTablePagination from "../hooks/useTablePagination";
import TablePagination from "../components/common/TablePagination";

import "../styles/customers.css";
import Modal from "../components/common/Modal";
import Avatar from "../components/common/Avatar";

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function getTenureDays(customer) {
  const raw = customer.tenure_days;
  if (raw != null && !isNaN(Number(raw))) {
    return Number(raw);
  }

  if (customer.created_at) {
    const created = new Date(customer.created_at);
    if (!isNaN(created.getTime())) {
      const diffMs = Date.now() - created.getTime();
      const diffDays = Math.max(
        1,
        Math.floor(diffMs / (1000 * 60 * 60 * 24))
      );
      return diffDays;
    }
  }

  return null;
}

function formatTenureFromCustomer(customer) {
  const days = getTenureDays(customer);
  if (days == null) return "—";

  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;

  const months = days / 30;
  if (months < 12) return `${Math.round(months * 10) / 10} mo`;

  const years = days / 365;
  return `${Math.round(years * 10) / 10} yr`;
}

function getSortValue(customer, field) {
  switch (field) {
    case "customer": return customer.name || "";
    case "contact": return customer.email || customer.phone || "";
    case "channel": return customer.channel || "";
    case "projects": return Number(customer.total_projects ?? 0);
    case "products": return Number(customer.total_products ?? 0);
    case "tenure": return getTenureDays(customer) ?? 0;
    case "status": return customer.is_active ? 1 : 0;
    default: return "";
  }
}

function formatPhoneDigits(digits) {
  const only = (digits || "").slice(0, 10);
  const len = only.length;

  if (!len) return "";
  if (len <= 3) return `(${only}`;
  if (len <= 6) return `(${only.slice(0, 3)}) ${only.slice(3)}`;
  return `(${only.slice(0, 3)}) ${only.slice(3, 6)}-${only.slice(6)}`;
}

/**
 * Format a phone number into "(123) 456-7890 x1234" style.
 * First 10 digits = main number, anything after = extension.
 */
function formatPhoneWithExtension(raw) {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";

  const main = digits.slice(0, 10);
  const ext = digits.slice(10);

  const base = formatPhoneDigits(main);
  if (!ext) return base;

  return `${base} x${ext}`;
}

/**
 * Used for inputs – same behavior as display formatting.
 */
function formatPhoneInput(raw) {
  return formatPhoneWithExtension(raw);
}

function isValidEmail(email) {
  if (!email) return true; // treat empty as "no email", not invalid
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function getChannelClass(channelRaw) {
  const value = (channelRaw || "").trim().toLowerCase();
  const base = "badge badge--channel";

  if (!value) return `${base} badge--channel-neutral`;
  if (value.includes("etsy")) return `${base} badge--channel-etsy`;
  if (value === "ig" || value.includes("instagram"))
    return `${base} badge--channel-instagram`;
  if (value.includes("craft"))
    return `${base} badge--channel-craftfair`;
  if (value.includes("ref") || value.includes("word-of-mouth"))
    return `${base} badge--channel-referral`;

  return `${base} badge--channel-neutral`;
}

// ------------------------------------------------------------
// New Customer Modal
// ------------------------------------------------------------

function NewCustomerModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("");
  const [notes, setNotes] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isVip, setIsVip] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setPhone("");
      setChannel("");
      setNotes("");
      setAddress1("");
      setAddress2("");
      setCity("");
      setStateRegion("");
      setPostalCode("");
      setIsVip(false);
      setLoading(false);
      setError(null);
      setFieldErrors({});
    }
  }, [open]);

  const errorText = (field) =>
    Array.isArray(fieldErrors[field]) ? fieldErrors[field].join(" ") : null;

  async function handleSubmit(e) {
    e.preventDefault();

    const clientErrors = {};
    if (!name.trim()) {
      clientErrors.name = ["Name is required."];
    }
    if (!isValidEmail(email)) {
      clientErrors.email = ["Enter a valid email address."];
    }

    if (Object.keys(clientErrors).length) {
      setFieldErrors(clientErrors);
      setError("Please fix the highlighted fields.");
      return;
    }

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
        address_line1: address1,
        address_line2: address2,
        city,
        state: stateRegion,
        postal_code: postalCode,
        is_vip: isVip,
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

  const footer = (
    <>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="new-customer-form"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? "Saving…" : "Add customer"}
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Customer"
      size="sm"
      variant="primary"
      footer={footer}
    >
      {error && (
        <p className="text-error" style={{ marginBottom: "0.75rem" }}>
          {error}
        </p>
      )}

      <form
        id="new-customer-form"
        onSubmit={handleSubmit}
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
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            placeholder="(555) 123-4567 x1234"
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

        {/* Address lines */}
        <div className="form-field form-field--full">
          <label className="form-label">Address line 1</label>
          <input
            className="form-input"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            placeholder="Street address"
          />
          {errorText("address_line1") && (
            <p className="text-error">{errorText("address_line1")}</p>
          )}
        </div>

        <div className="form-field form-field--full">
          <label className="form-label">Address line 2</label>
          <input
            className="form-input"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            placeholder="Apartment, suite, etc. (optional)"
          />
          {errorText("address_line2") && (
            <p className="text-error">{errorText("address_line2")}</p>
          )}
        </div>

        {/* City / State / Zip */}
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
          <label className="form-label">State</label>
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
          <label className="form-label">ZIP / Postal code</label>
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
          <label className="form-label form-checkbox">
            <input
              type="checkbox"
              checked={isVip}
              onChange={(e) => setIsVip(e.target.checked)}
            />
            <span>Mark as VIP customer</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}

// ------------------------------------------------------------
// Quick Edit Modal
// ------------------------------------------------------------

function QuickEditCustomerModal({ open, customer, onClose, onUpdated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("");
  const [notes, setNotes] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isVip, setIsVip] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && customer) {
      setName(customer.name || "");
      setEmail(customer.email || "");
      setPhone(formatPhoneWithExtension(customer.phone || ""));
      setChannel(customer.channel || "");
      setNotes(customer.notes || "");
      setAddress1(customer.address_line1 || "");
      setAddress2(customer.address_line2 || "");
      setCity(customer.city || "");
      setStateRegion(customer.state || "");
      setPostalCode(customer.postal_code || "");
      setIsVip(!!customer.is_vip);

      setFieldErrors({});
      setError(null);
      setLoading(false);
    }
  }, [open, customer]);

  if (!open || !customer) return null;

  const errorText = (field) =>
    Array.isArray(fieldErrors[field]) ? fieldErrors[field].join(" ") : null;

  async function handleSubmit(e) {
    e.preventDefault();

    const clientErrors = {};
    if (!name.trim()) {
      clientErrors.name = ["Name is required."];
    }
    if (!isValidEmail(email)) {
      clientErrors.email = ["Enter a valid email address."];
    }

    if (Object.keys(clientErrors).length) {
      setFieldErrors(clientErrors);
      setError("Please fix the highlighted fields.");
      return;
    }

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
        address_line1: address1,
        address_line2: address2,
        city,
        state: stateRegion,
        postal_code: postalCode,
        is_vip: isVip,
      };

      const updated = await updateCustomer(customer.id, payload);
      onUpdated?.(updated);
      onClose();
    } catch (err) {
      console.error("updateCustomer error:", err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setFieldErrors(data);
        setError("Please fix the highlighted fields.");
      } else {
        setError("Failed to update customer.");
      }
    } finally {
      setLoading(false);
    }
  }

  const footer = (
    <>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="quick-edit-form"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Quick Edit: ${customer.name}`}
      size="sm"
      variant="primary"
      footer={footer}
    >
      {error && (
        <p className="text-error" style={{ marginBottom: "0.75rem" }}>
          {error}
        </p>
      )}

      <form
        id="quick-edit-form"
        onSubmit={handleSubmit}
        className="form-grid"
      >
        <div className="form-field form-field--full">
          <label className="form-label">Name</label>
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
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            placeholder="(555) 123-4567 x1234"
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
          />
          {errorText("channel") && (
            <p className="text-error">{errorText("channel")}</p>
          )}
        </div>

        {/* Address lines */}
        <div className="form-field form-field--full">
          <label className="form-label">Address line 1</label>
          <input
            className="form-input"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
          />
          {errorText("address_line1") && (
            <p className="text-error">{errorText("address_line1")}</p>
          )}
        </div>

        <div className="form-field form-field--full">
          <label className="form-label">Address line 2</label>
          <input
            className="form-input"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
          />
          {errorText("address_line2") && (
            <p className="text-error">{errorText("address_line2")}</p>
          )}
        </div>

        {/* City / State / Zip */}
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
          <label className="form-label">State</label>
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
          <label className="form-label">ZIP / Postal code</label>
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
          <label className="form-label form-checkbox">
            <input
              type="checkbox"
              checked={isVip}
              onChange={(e) => setIsVip(e.target.checked)}
            />
            <span>VIP customer</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}

// ------------------------------------------------------------
// Customers Page
// ------------------------------------------------------------

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vipFilter, setVipFilter] = useState("all");

  const [sortField, setSortField] = useState("customer");
  const [sortDirection, setSortDirection] = useState("asc");

  const [pageSize, setPageSize] = useState(25);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showNewModal, setShowNewModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Load customers
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchCustomers();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];

        if (!cancelled) {
          setCustomers(list);
          setFiltered(list);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load customers.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => (cancelled = true);
  }, []);

  // Filtering + search + sort
  useEffect(() => {
    let list = [...customers];

    // search
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter((c) =>
        [
          c.name,
          c.email,
          c.phone,
          c.notes,
          c.channel,
          formatTenureFromCustomer(c),
          c.is_vip ? "vip" : "standard"
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }

    // status filter
    if (statusFilter !== "all") {
      list = list.filter(
        (c) => (statusFilter === "active") === !!c.is_active
      );
    }

    // VIP filter
    if (vipFilter !== "all") {
      const wantVip = vipFilter === "yes";
      list = list.filter((c) => !!c.is_vip === wantVip);
    }

    // sort
    list.sort((a, b) => {
      const av = getSortValue(a, sortField);
      const bv = getSortValue(b, sortField);

      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));

      return sortDirection === "asc" ? cmp : -cmp;
    });

    setFiltered(list);
  }, [customers, search, statusFilter, vipFilter, sortField, sortDirection]);

  const {
    pagedRows,
    page,
    pageCount,
    nextPage,
    prevPage
  } = useTablePagination(filtered, pageSize);


  // sorting behavior
  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function headerSortClass(field) {
    let c = "table-sortable";
    if (sortField === field) {
      c += sortDirection === "asc" ? " sorted-asc" : " sorted-desc";
    }
    return c;
  }

  async function toggleActive(customer) {
    try {
      const updated = await updateCustomer(customer.id, {
        is_active: !customer.is_active
      });
      setCustomers((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (err) {
      console.error("toggleActive failed", err);
    }
  }


  // --------------------------- RENDER -----------------------------

  if (loading) {
    return <div className="page"><p>Loading customers…</p></div>;
  }

  if (error) {
    return (
      <div className="page">
        <p className="text-error">{error}</p>
        <button className="btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page">

      <div className="page-header">
        <p className="page-subtitle">
          People who buy your work, with a quick view of how much history you have with them.
        </p>
      </div>

      <div className="table-page">
        <div className="table-card">

          {/* ----------- Toolbar ----------- */}
          <div className="table-card__toolbar customers-toolbar">

            {/* Left side: search + filters */}
            <div className="customers-toolbar-left">

              <div className="table-card__search customers-search-wrapper">
                <Search size={16} className="customers-search-icon" />
                <input
                  placeholder="Search… (e.g. name, email, channel, VIP)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="customers-toolbar-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="active">Active only</option>
                <option value="all">All statuses</option>
                <option value="inactive">Inactive only</option>
              </select>

              <select
                className="customers-toolbar-select"
                value={vipFilter}
                onChange={(e) => setVipFilter(e.target.value)}
              >
                <option value="all">All customers</option>
                <option value="yes">VIP only</option>
                <option value="no">Non-VIP only</option>
              </select>

              <div className="customers-rows-per-page">
                <span>Rows per page</span>
                <select
                  className="customers-toolbar-select customers-page-size-select"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <span className="customers-count">
                Showing {pagedRows.length} of {filtered.length}
              </span>
            </div>

            {/* Right side */}
            <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
              <Plus size={16} />
              <span>New Customer</span>
            </button>
          </div>

          {/* ----------- Table ----------- */}
          <div className="settings-card--table">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th className={headerSortClass("customer")} onClick={() => handleSort("customer")}>
                    Customer
                  </th>
                  <th className={headerSortClass("contact")} onClick={() => handleSort("contact")}>
                    Contact
                  </th>
                  <th className={headerSortClass("channel")} onClick={() => handleSort("channel")}>
                    Channel
                  </th>
                  <th className={headerSortClass("projects")} onClick={() => handleSort("projects")}>
                    Projects
                  </th>
                  <th className={headerSortClass("products")} onClick={() => handleSort("products")}>
                    Products
                  </th>
                  <th className={headerSortClass("tenure")} onClick={() => handleSort("tenure")}>
                    Tenure
                  </th>
                  <th className={headerSortClass("status")} onClick={() => handleSort("status")}>
                    Active
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {pagedRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="table-empty-row">
                      No customers found.
                    </td>
                  </tr>
                )}

                {pagedRows.map((c) => (
                  <tr key={c.id}>

                    {/* Customer cell */}
                    <td>
                      <div className="customer-cell">
                        <Avatar
                          name={c.name}
                          imageUrl={c.avatar}
                          idForColor={c.id}
                          size="sm"
                          className="customer-avatar"
                        />
                        <div className="customer-main">
                          <div className="customer-name-row">
                            <Link to={`/customers/${c.id}`} className="customer-name">
                              {c.name}
                            </Link>

                            {c.is_vip && (
                              <span className="badge--vip-chip">VIP</span>
                            )}
                          </div>

                          {c.notes && (
                            <div className="customer-note">{c.notes}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td>
                      <div className="customer-contact">
                        {c.email && (
                          <div className="customer-email">{c.email}</div>
                        )}
                        {c.phone && (
                          <div className="customer-phone">{formatPhoneWithExtension(c.phone)}</div>
                        )}
                      </div>
                    </td>

                    {/* Channel */}
                    <td> 
                      {c.channel ? (
                          <span className={getChannelClass(c.channel)}>{c.channel}</span>
                        ) : (
                          "—"
                      )}
                    </td>
                    {/* Projects / Products / Tenure */}
                    <td>{c.total_projects ?? 0}</td>
                    <td>{c.total_products ?? 0}</td>
                    <td>{formatTenureFromCustomer(c)}</td>

                    {/* Active Switch */}
                    <td>
                      <button
                        className={`toggle ${c.is_active ? "toggle--on" : "toggle--off"}`}
                        onClick={() => toggleActive(c)}
                      >
                        <span className="toggle__track">
                          <span className="toggle__label">
                            {c.is_active ? "Yes" : "No"}
                          </span>
                          <span className="toggle__thumb" />
                        </span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="customers-actions-cell">
                      <button
                        className="btn-ghost customers-icon-btn"
                        title="Quick Edit"
                        onClick={() => setEditingCustomer(c)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="btn-ghost customers-icon-btn"
                        title="Archive Customer"
                        onClick={() => toggleActive(c)}
                      >
                        <Package size={16} />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="table-card__pagination">
            <TablePagination
              page={page}
              pageCount={pageCount}
              onPrev={prevPage}
              onNext={nextPage}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewCustomerModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={(created) => setCustomers((prev) => [created, ...prev])}
      />

      <QuickEditCustomerModal
        open={!!editingCustomer}
        customer={editingCustomer}
        onClose={() => setEditingCustomer(null)}
        onUpdated={(updated) =>
          setCustomers((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          )
        }
      />
    </div>
  );
}
