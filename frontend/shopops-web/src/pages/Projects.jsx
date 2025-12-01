// src/pages/Projects.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchProjects,
  createProject,
  cancelProject,
  logProjectSale,
  moveProjectStage,
} from "../api/projects";
import { fetchProductTemplates } from "../api/products";
import { fetchCustomers } from "../api/customers";
import Modal from "../components/common/Modal";


function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function formatMoney(amount) {
  if (amount == null || isNaN(Number(amount))) return "—";
  return `$${Number(amount).toFixed(2)}`;
}

// Rush logic: due within 3 days (including overdue)
function isRush(project) {
  if (!project?.due_date) return false;
  const due = new Date(project.due_date);
  if (Number.isNaN(due.getTime())) return false;

  const now = new Date();
  const msDiff = due.getTime() - now.getTime();
  const daysDiff = msDiff / (1000 * 60 * 60 * 24);

  return daysDiff <= 3;
}

/** New Project Modal (industrial themed, using shared Modal) */
function NewProjectModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [dueDate, setDueDate] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [notes, setNotes] = useState("");

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customersError, setCustomersError] = useState(null);

  // Load product templates + customers when modal opens
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadTemplates() {
      setLoadingTemplates(true);
      setTemplatesError(null);
      try {
        const data = await fetchProductTemplates();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];
        if (!cancelled) setTemplates(items);
      } catch (err) {
        console.error("fetchProductTemplates error:", err);
        if (!cancelled) {
          setTemplatesError("Failed to load templates.");
        }
      } finally {
        if (!cancelled) setLoadingTemplates(false);
      }
    }

    async function loadCustomers() {
      setLoadingCustomers(true);
      setCustomersError(null);
      try {
        const data = await fetchCustomers();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];
        if (!cancelled) setCustomers(items);
      } catch (err) {
        console.error("fetchCustomers error:", err);
        if (!cancelled) {
          setCustomersError("Failed to load customers.");
        }
      } finally {
        if (!cancelled) setLoadingCustomers(false);
      }
    }

    loadTemplates();
    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setName("");
      setTemplateId("");
      setQuantity(1);
      setDueDate("");
      setExpectedPrice("");
      setNotes("");
      setError(null);
      setFieldErrors({});
      setTemplatesError(null);

      setCustomerId("");
      setCustomerSearch("");
      setCustomerDropdownOpen(false);
      setCustomersError(null);
    }
  }, [open]);

  // Auto-suggest expected price from template × quantity if user hasn't typed one
  useEffect(() => {
    const qty = quantity ? Math.max(1, Number(quantity)) : 1;
    const tpl = templates.find((t) => t.id === Number(templateId));
    const basePrice = tpl?.base_price ?? tpl?.basePrice ?? null;

    if (tpl && basePrice != null && !expectedPrice) {
      const suggested = Number(basePrice) * qty;
      if (!Number.isNaN(suggested)) {
        setExpectedPrice(String(suggested));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, quantity, templates]);

  const errorText = (field) =>
    Array.isArray(fieldErrors[field]) ? fieldErrors[field].join(" ") : null;

  const selectedTemplate =
    templates.find((t) => t.id === Number(templateId)) || null;

  // Filter customers for dropdown
  const customerTerm = customerSearch.trim().toLowerCase();
  const filteredCustomers = customerTerm
    ? customers.filter((c) => {
        const haystack = [c.name, c.email, c.channel]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(customerTerm);
      })
    : customers;

  const limitedCustomers = filteredCustomers.slice(0, 50);

  function handleCustomerInputChange(e) {
    const value = e.target.value;
    setCustomerSearch(value);
    // Once user starts typing, clear the selected id so they pick again
    setCustomerId("");
    setCustomerDropdownOpen(true);
  }

  function handleCustomerSelect(c) {
    const label =
      c.name ||
      c.email ||
      (c.channel ? `Customer #${c.id} (${c.channel})` : `Customer #${c.id}`);

    setCustomerId(c.id);
    setCustomerSearch(label);
    setCustomerDropdownOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const qty = quantity ? Math.max(1, Number(quantity)) : 1;

      const payload = {
        template: templateId ? Number(templateId) : null,
        quantity: qty,
        name: name || null,
        due_date: dueDate || null,
        expected_price: expectedPrice ? parseFloat(expectedPrice) : null,
        notes: notes || "",
        customer: customerId ? Number(customerId) : null,
      };

      const created = await createProject(payload);
      onCreated?.(created);
      onClose();
    } catch (err) {
      console.error("createProject error:", err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setFieldErrors(data);
        setError("Please fix the highlighted fields.");
      } else {
        setError("Failed to create project. Check required fields.");
      }
    } finally {
      setLoading(false);
    }
  }

  const templatesLoadingLabel =
    loadingTemplates && templates.length === 0
      ? "Loading templates…"
      : "Select a template";

  const modalFooter = (
    <div className="modal-footer-actions">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="new-project-form"
        className="btn"
        disabled={loading}
      >
        {loading ? "Creating…" : "Create project"}
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New project"
      footer={modalFooter}
    >
      <p className="page-subtitle" style={{ marginTop: 0, marginBottom: "0.75rem" }}>
        Choose a product template, then tweak quantity, customer, and pricing.
        Workflow and stage will be inferred automatically.
      </p>

      {error && (
        <p className="text-error" style={{ marginBottom: "0.75rem" }}>
          {error}
        </p>
      )}

      {templatesError && (
        <p
          style={{
            marginBottom: "0.75rem",
            fontSize: "0.8rem",
            color: "#fbbf24",
          }}
        >
          {templatesError} You can still enter a template ID manually.
        </p>
      )}

      <form
        id="new-project-form"
        className="form-grid"
        onSubmit={handleSubmit}
      >
        {/* Template select */}
        <div className="form-field form-field--full">
          <label className="form-label">Template *</label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            required
            disabled={loadingTemplates && templates.length === 0}
            className="form-input"
          >
            <option value="">{templatesLoadingLabel}</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}{" "}
                {tpl.base_price != null
                  ? `(${tpl.base_price} ${tpl.currency || ""})`
                  : ""}
              </option>
            ))}
          </select>
          {errorText("template") && (
            <p className="text-error" style={{ marginTop: "0.15rem" }}>
              {errorText("template")}
            </p>
          )}

          {templatesError && (
            <div style={{ marginTop: "0.4rem" }}>
              <label className="form-label">Or enter Template ID</label>
              <input
                type="number"
                min="1"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="form-input"
              />
            </div>
          )}
        </div>

        {/* Project name */}
        <div className="form-field form-field--full">
          <label className="form-label">Project name</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              selectedTemplate?.name
                ? `Defaults to template name: ${selectedTemplate.name}`
                : "Optional display name"
            }
          />
          {errorText("name") && (
            <p className="text-error" style={{ marginTop: "0.15rem" }}>
              {errorText("name")}
            </p>
          )}
        </div>

        {/* Customer combobox */}
        <div className="form-field form-field--full">
          <label className="form-label">Customer</label>

          {customersError && (
            <p
              style={{
                margin: "0 0 0.35rem",
                fontSize: "0.75rem",
                color: "#fbbf24",
              }}
            >
              {customersError} You can still create a project without linking a
              customer.
            </p>
          )}

          <div style={{ position: "relative" }}>
            <input
              type="text"
              className="form-input"
              value={customerSearch}
              onChange={handleCustomerInputChange}
              onFocus={() => setCustomerDropdownOpen(true)}
              placeholder={
                loadingCustomers && customers.length === 0
                  ? "Loading customers…"
                  : "Select a customer (optional)"
              }
              disabled={loadingCustomers && customers.length === 0}
              style={{ paddingRight: "1.6rem" }}
            />
            {/* Little dropdown arrow, purely visual */}
            <span
              style={{
                position: "absolute",
                right: "0.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.8rem",
                color: "#9ca3af",
                pointerEvents: "none",
              }}
            >
              ▾
            </span>

            {customerDropdownOpen &&
              customers.length > 0 &&
              limitedCustomers.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    marginTop: "0.2rem",
                    left: 0,
                    right: 0,
                    maxHeight: "220px",
                    overflowY: "auto",
                    background: "#111827",
                    borderRadius: "0.5rem",
                    boxShadow:
                      "0 10px 15px -3px rgba(15,23,42,0.5), 0 4px 6px -4px rgba(15,23,42,0.5)",
                    border: "1px solid #374151",
                  }}
                >
                  {limitedCustomers.map((c) => {
                    const label =
                      c.name ||
                      c.email ||
                      (c.channel
                        ? `Customer #${c.id} (${c.channel})`
                        : `Customer #${c.id}`);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCustomerSelect(c)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "0.4rem 0.6rem",
                          border: "none",
                          background: "transparent",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          color: "#e5e7eb",
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <div style={{ fontWeight: 500 }}>{label}</div>
                        {(c.email || c.channel) && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#9ca3af",
                            }}
                          >
                            {c.email}
                            {c.email && c.channel ? " · " : ""}
                            {c.channel}
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {filteredCustomers.length > limitedCustomers.length && (
                    <div
                      style={{
                        padding: "0.35rem 0.6rem",
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        borderTop: "1px solid #374151",
                        background: "#030712",
                      }}
                    >
                      …and {filteredCustomers.length - limitedCustomers.length}{" "}
                      more. Refine search.
                    </div>
                  )}
                </div>
              )}
          </div>

          {customers.length === 0 &&
            !loadingCustomers &&
            !customersError && (
              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                }}
              >
                No customers yet. You can add them from the Customers page
                later.
              </p>
            )}

          {errorText("customer") && (
            <p className="text-error" style={{ marginTop: "0.15rem" }}>
              {errorText("customer")}
            </p>
          )}
        </div>

        {/* Quantity + due date */}
        <div className="form-field">
          <label className="form-label">Quantity</label>
          <input
            className="form-input"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          {errorText("quantity") && (
            <p className="text-error" style={{ marginTop: "0.15rem" }}>
              {errorText("quantity")}
            </p>
          )}
        </div>

        <div className="form-field">
          <label className="form-label">Due date</label>
          <input
            className="form-input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          {errorText("due_date") && (
            <p className="text-error" style={{ marginTop: "0.15rem" }}>
              {errorText("due_date")}
            </p>
          )}
        </div>

        {/* Expected price */}
        <div className="form-field form-field--full">
          <label className="form-label">Expected price</label>
          <input
            className="form-input"
            type="number"
            min="0"
            step="0.01"
            value={expectedPrice}
            onChange={(e) => setExpectedPrice(e.target.value)}
            placeholder={
              selectedTemplate?.base_price != null
                ? `Defaults from template base_price × quantity`
                : "Optional – will default from template if set"
            }
          />
          {errorText("expected_price") && (
            <p className="text-error" style={{ marginTop: "0.15rem" }}>
              {errorText("expected_price")}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="form-field form-field--full">
          <label className="form-label">Notes</label>
          <textarea
            className="form-input form-textarea"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional internal notes about this project."
          />
          {errorText("notes") && (
            <p className="text-error" style={{ marginTop: "0.15rem" }}>
              {errorText("notes")}
            </p>
          )}
        </div>

        {/* Selected template summary */}
        {selectedTemplate && (
          <div
            className="form-field form-field--full"
            style={{
              marginTop: "0.25rem",
              padding: "0.5rem 0.6rem",
              borderRadius: "0.5rem",
              background: "#020617",
              border: "1px solid #1f2937",
              fontSize: "0.8rem",
              color: "#e5e7eb",
            }}
          >
            <strong>{selectedTemplate.name}</strong>
            {selectedTemplate.base_price != null && (
              <>
                {" · Base price: "}
                {selectedTemplate.base_price}{" "}
                {selectedTemplate.currency || ""}
              </>
            )}
            {selectedTemplate.estimated_labor_hours != null && (
              <>
                {" · Est. hours: "}
                {selectedTemplate.estimated_labor_hours}
              </>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}


/** Cancel Project Modal */
function CancelProjectModal({ project, onClose, onUpdated }) {
  const [reason, setReason] = useState("");
  const [expectedPrice, setExpectedPrice] = useState(
    project?.expected_price ?? ""
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!project) {
      setReason("");
      setExpectedPrice("");
      setNotes("");
      setError(null);
      setFieldErrors({});
    } else {
      setExpectedPrice(project.expected_price ?? "");
    }
  }, [project]);

  if (!project) return null;

  const errorText = (field) =>
    Array.isArray(fieldErrors[field]) ? fieldErrors[field].join(" ") : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const payload = {
        reason: reason || "",
        expected_price: expectedPrice ? parseFloat(expectedPrice) : undefined,
        notes: notes || "",
      };

      const updated = await cancelProject(project.id, payload);
      onUpdated?.(updated);
      onClose();
    } catch (err) {
      console.error("cancelProject error:", err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setFieldErrors(data);
        setError("Please fix the highlighted fields.");
      } else {
        setError("Failed to cancel project.");
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
          maxWidth: "480px",
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
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
              Cancel project: {project.name || `#${project.id}`}
            </h2>
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
            This will mark the project as cancelled. You can record a reason and
            an expected price for reporting.
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
                Reason
              </label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Client changed mind"
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                }}
              />
              {errorText("reason") && (
                <p
                  style={{
                    margin: "0.15rem 0 0",
                    fontSize: "0.75rem",
                    color: "#b91c1c",
                  }}
                >
                  {errorText("reason")}
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
                Expected price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                placeholder="Optional"
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                }}
              />
              {errorText("expected_price") && (
                <p
                  style={{
                    margin: "0.15rem 0 0",
                    fontSize: "0.75rem",
                    color: "#b91c1c",
                  }}
                >
                  {errorText("expected_price")}
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
                placeholder="Optional internal note about why it was cancelled."
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
                justifyContent: "flex-end",
                gap: "0.5rem",
                marginTop: "0.5rem",
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
                Keep project
              </button>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Cancelling…" : "Cancel project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/** Log Sale Modal */
function LogSaleModal({ project, onClose, onUpdated }) {
  const [price, setPrice] = useState(project?.expected_price ?? "");
  const [fees, setFees] = useState("");
  const [soldAt, setSoldAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!project) {
      setPrice("");
      setFees("");
      setSoldAt("");
      setNotes("");
      setError(null);
      setFieldErrors({});
    } else {
      setPrice(project.expected_price ?? "");
    }
  }, [project]);

  if (!project) return null;

  const errorText = (field) =>
    Array.isArray(fieldErrors[field]) ? fieldErrors[field].join(" ") : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const payload = {
        price: price ? parseFloat(price) : 0,
        channel: "other",
        fees: fees ? parseFloat(fees) : undefined,
        sold_at: soldAt || undefined,
        notes: notes || "",
      };

      const result = await logProjectSale(project.id, payload);
      onUpdated?.(result.project);
      onClose();
    } catch (err) {
      console.error("logProjectSale error:", err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setFieldErrors(data);
        setError("Please fix the highlighted fields.");
      } else {
        setError("Failed to log sale.");
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
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
              Log sale for: {project.name || `#${project.id}`}
            </h2>
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
            This will create a Sale record and mark the project as completed.
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
                Sale price *
              </label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                }}
              />
              {errorText("price") && (
                <p
                  style={{
                    margin: "0.15rem 0 0",
                    fontSize: "0.75rem",
                    color: "#b91c1c",
                  }}
                >
                  {errorText("price")}
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
                Fees
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                placeholder="Platform or processing fees (optional)"
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                }}
              />
              {errorText("fees") && (
                <p
                  style={{
                    margin: "0.15rem 0 0",
                    fontSize: "0.75rem",
                    color: "#b91c1c",
                  }}
                >
                  {errorText("fees")}
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
                Sold at (optional)
              </label>
              <input
                type="datetime-local"
                value={soldAt}
                onChange={(e) => setSoldAt(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                }}
              />
              {errorText("sold_at") && (
                <p
                  style={{
                    margin: "0.15rem 0 0",
                    fontSize: "0.75rem",
                    color: "#b91c1c",
                  }}
                >
                  {errorText("sold_at")}
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
                placeholder="Optional note about where/how it sold."
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
                justifyContent: "flex-end",
                gap: "0.5rem",
                marginTop: "0.5rem",
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
                Back
              </button>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Saving…" : "Log sale"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/** Move Stage Modal */
function MoveStageModal({ project, onClose, onUpdated }) {
  const [stageId, setStageId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!project) {
      setStageId("");
      setError(null);
      setFieldErrors({});
      return;
    }

    // Pre-fill with current stage id, if available
    if (project.current_stage) {
      setStageId(project.current_stage);
    } else if (project.current_stage_id) {
      setStageId(project.current_stage_id);
    } else {
      setStageId("");
    }
  }, [project]);

  if (!project) return null;

  const errorText = (field) =>
    Array.isArray(fieldErrors[field]) ? fieldErrors[field].join(" ") : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const numericStageId = Number(stageId);
      if (!numericStageId || Number.isNaN(numericStageId)) {
        setError("Stage ID must be a valid number.");
        setLoading(false);
        return;
      }

      const updated = await moveProjectStage(project.id, numericStageId);
      onUpdated?.(updated);
      onClose();
    } catch (err) {
      console.error("moveProjectStage error:", err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        setFieldErrors(data);
        setError(
          data.detail ||
            "Failed to move project. Make sure the stage belongs to this workflow."
        );
      } else {
        setError("Failed to move project.");
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
          maxWidth: "420px",
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
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
              Move stage: {project.name || `#${project.id}`}
            </h2>
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
            Enter the ID of the workflow stage you want this project to move to.
            (You can look up stage IDs in the Workflow admin or API for now.)
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
                Stage ID
              </label>
              <input
                type="number"
                min="1"
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.9rem",
                }}
              />
              {errorText("stage_id") && (
                <p
                  style={{
                    margin: "0.15rem 0 0",
                    fontSize: "0.75rem",
                    color: "#b91c1c",
                  }}
                >
                  {errorText("stage_id")}
                </p>
              )}
            </div>

            <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              <div>
                Current stage:{" "}
                <strong>{project.current_stage_name || "—"}</strong>
              </div>
              {project.workflow_name && (
                <div>
                  Workflow: <strong>{project.workflow_name}</strong>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
                marginTop: "0.5rem",
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
                {loading ? "Moving…" : "Move stage"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/** Projects list page */
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [saleTarget, setSaleTarget] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null);

  // Load projects
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchProjects();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];

        if (!cancelled) {
          setProjects(items);
          setFiltered(items);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load projects");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtering logic (⭐ includes Rush in search)
  useEffect(() => {
    let list = [...projects];

    if (search.trim()) {
      const term = search.toLowerCase();

      list = list.filter((p) => {
        const rushFlag = isRush(p); // ⭐ RUSH: include rush marker in search
        const haystack = [
          p.name,
          p.customer_name,
          p.template_name,
          rushFlag ? "rush urgent" : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(term);
      });
    }

    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    setFiltered(list);
  }, [projects, search, statusFilter]);

  const list = Array.isArray(filtered) ? filtered : [];

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Projects</h1>
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1 className="page-title">Projects</h1>
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
        <h1>Projects</h1>
        <p>Your active builds, completed jobs, and cancelled work.</p>
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
            placeholder="Search by name, customer, template, or 'rush'…"
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
            <option value="all">All statuses</option>
            <option value="queued">Queued</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
            {list.length} shown
          </span>
        </div>

        <button className="btn" onClick={() => setShowNewModal(true)}>
          + New Project
        </button>
      </div>

      {/* Table */}
      <div className="settings-card settings-card--table">
        <table className="table table-striped">
          <thead>
            <tr>
              {[
                "Project",
                "Template",
                "Customer",
                "Workflow",
                "Stage",
                "Due",
                "Price",
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
                  No matching projects.
                </td>
              </tr>
            )}

            {list.map((p) => {
              const rush = isRush(p);
              return (
                <tr key={p.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <Link to={`/projects/${p.id}`}>
                        {p.name || `Project #${p.id}`}
                      </Link>
                      {rush && (
                        <span
                          style={{
                            padding: "0.1rem 0.5rem",
                            borderRadius: "999px",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            background: "#fee2e2",
                            color: "#b91c1c",
                            border: "1px solid #fecaca",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Rush
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{p.template_name || "—"}</td>
                  <td>
                    {p.customer_name ? (
                      <Link to={`/customers/${p.customer}`}>
                        {p.customer_name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{p.workflow_name || "—"}</td>
                  <td>{p.current_stage_name || "—"}</td>
                  <td>{formatDate(p.due_date)}</td>
                  <td
                    style={{
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatMoney(p.expected_price)}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        background:
                          {
                            completed: "#d1fae5",
                            active: "#dbeafe",
                            queued: "#e5e7eb",
                            cancelled: "#fee2e2",
                          }[p.status] || "#e5e7eb",
                        color:
                          {
                            completed: "#065f46",
                            active: "#1e40af",
                            queued: "#374151",
                            cancelled: "#991b1b",
                          }[p.status] || "#374151",
                      }}
                    >
                      {p.status || "—"}
                    </span>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {p.status === "active" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSaleTarget(p)}
                          style={{
                            borderRadius: "999px",
                            border: "1px solid #d1d5db",
                            padding: "0.15rem 0.6rem",
                            fontSize: "0.75rem",
                            background: "#ffffff",
                            cursor: "pointer",
                            marginRight: "0.25rem",
                          }}
                        >
                          Log sale
                        </button>
                        <button
                          type="button"
                          onClick={() => setMoveTarget(p)}
                          style={{
                            borderRadius: "999px",
                            border: "1px solid #bfdbfe",
                            padding: "0.15rem 0.6rem",
                            fontSize: "0.75rem",
                            background: "#eff6ff",
                            cursor: "pointer",
                            marginRight: "0.25rem",
                          }}
                        >
                          Move
                        </button>
                        <button
                          type="button"
                          onClick={() => setCancelTarget(p)}
                          style={{
                            borderRadius: "999px",
                            border: "1px solid #fecaca",
                            padding: "0.15rem 0.6rem",
                            fontSize: "0.75rem",
                            background: "#fef2f2",
                            cursor: "pointer",
                            color: "#b91c1c",
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {p.status === "completed" && (
                      <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        Completed
                      </span>
                    )}
                    {p.status === "cancelled" && (
                      <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        Cancelled
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>


      <NewProjectModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={(proj) => {
          setProjects((prev) => [proj, ...prev]);
        }}
      />

      <CancelProjectModal
        project={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onUpdated={(updated) => {
          setProjects((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          );
        }}
      />

      <LogSaleModal
        project={saleTarget}
        onClose={() => setSaleTarget(null)}
        onUpdated={(updated) => {
          setProjects((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          );
        }}
      />

      <MoveStageModal
        project={moveTarget}
        onClose={() => setMoveTarget(null)}
        onUpdated={(updated) => {
          setProjects((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          );
        }}
      />
    </div>
  );
}
