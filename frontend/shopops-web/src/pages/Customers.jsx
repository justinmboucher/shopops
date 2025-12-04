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


// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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


// ------------------------------------------------------------
// New Customer Modal
// ------------------------------------------------------------

function NewCustomerModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("");
  const [notes, setNotes] = useState("");
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
      setIsVip(false);
      setFieldErrors({});
      setError(null);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const errorText = (f) =>
    Array.isArray(fieldErrors[f]) ? fieldErrors[f].join(" ") : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const created = await createCustomer({
        name,
        email,
        phone,
        channel,
        notes,
        is_vip: isVip
      });
      onCreated(created);
      onClose();
    } catch (err) {
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Customer</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && <p className="text-error">{error}</p>}

          <form id="newcustomer" onSubmit={handleSubmit}>

            <label className="form-label">Name</label>
            <input className="form-input" value={name}
                   onChange={(e) => setName(e.target.value)} />
            {errorText("name") && <p className="text-error">{errorText("name")}</p>}

            <label className="form-label">Email</label>
            <input className="form-input" value={email}
                   onChange={(e) => setEmail(e.target.value)} />

            <label className="form-label">Phone</label>
            <input className="form-input" value={phone}
                   onChange={(e) => setPhone(e.target.value)} />

            <label className="form-label">Channel</label>
            <input className="form-input" value={channel}
                   onChange={(e) => setChannel(e.target.value)} />

            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} value={notes}
                      onChange={(e) => setNotes(e.target.value)} />

            <div className="modal-checkbox-row">
              <input type="checkbox" id="newvip"
                     checked={isVip}
                     onChange={(e) => setIsVip(e.target.checked)} />
              <label htmlFor="newvip">VIP customer</label>
            </div>

          </form>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="newcustomer">
            {loading ? "Saving…" : "Add Customer"}
          </button>
        </div>
      </div>
    </div>
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
  const [isVip, setIsVip] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && customer) {
      setName(customer.name ?? "");
      setEmail(customer.email ?? "");
      setPhone(customer.phone ?? "");
      setChannel(customer.channel ?? "");
      setNotes(customer.notes ?? "");
      setIsVip(!!customer.is_vip);

      setError(null);
      setFieldErrors({});
      setLoading(false);
    }
  }, [open, customer]);

  if (!open || !customer) return null;

  const errorText = (f) =>
    Array.isArray(fieldErrors[f]) ? fieldErrors[f].join(" ") : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await updateCustomer(customer.id, {
        name,
        email,
        phone,
        channel,
        notes,
        is_vip: isVip
      });

      onUpdated(updated);
      onClose();
    } catch (err) {
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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Quick Edit: {customer.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && <p className="text-error">{error}</p>}

          <form id="quickedit" onSubmit={handleSubmit}>

            <label className="form-label">Name</label>
            <input className="form-input" value={name}
                   onChange={(e) => setName(e.target.value)} />
            {errorText("name") && <p className="text-error">{errorText("name")}</p>}

            <label className="form-label">Email</label>
            <input className="form-input" value={email}
                   onChange={(e) => setEmail(e.target.value)} />

            <label className="form-label">Phone</label>
            <input className="form-input" value={phone}
                   onChange={(e) => setPhone(e.target.value)} />

            <label className="form-label">Channel</label>
            <input className="form-input" value={channel}
                   onChange={(e) => setChannel(e.target.value)} />

            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} value={notes}
                      onChange={(e) => setNotes(e.target.value)} />

            <div className="modal-checkbox-row">
              <input type="checkbox" id="editvip"
                     checked={isVip}
                     onChange={(e) => setIsVip(e.target.checked)} />
              <label htmlFor="editvip">VIP customer</label>
            </div>

          </form>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="quickedit">
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
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
                        <div className="customer-avatar">
                          {c.avatar
                            ? <img src={c.avatar} alt={c.name} />
                            : <span>{getInitials(c.name)}</span>}
                        </div>

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
                          <div className="customer-phone">{c.phone}</div>
                        )}
                      </div>
                    </td>

                    {/* Channel */}
                    <td>{c.channel || "—"}</td>

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
