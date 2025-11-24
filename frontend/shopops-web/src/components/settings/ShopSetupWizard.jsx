// src/components/settings/ShopSetupWizard.jsx
import { useState, useEffect } from "react";
import { createShop, updateShop } from "../../api/shops";

const stepCardStyle = {
  borderRadius: "0.75rem",
  border: "1px solid #e5e7eb",
  padding: "1rem",
  background: "#ffffff",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  maxWidth: "640px",
};

const TIMEZONE_OPTIONS = [
  // Common US zones first
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",

  // Some other common ones
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Rome",

  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Kolkata",

  "Australia/Sydney",
  "Australia/Melbourne",

  "UTC",
];

function ShopSetupWizard({ onCompleted, shop }) {
  const isEditMode = !!shop;

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    timezone: "America/Chicago",
    currency: "USD",
    default_hourly_rate: 50,
    default_markup_pct: 20,
    theme: "system",
  });

  // When editing, hydrate form from existing shop
  useEffect(() => {
    if (shop) {
      setForm({
        name: shop.name || "",
        description: shop.description || "",
        timezone: shop.timezone || "America/Chicago",
        currency: shop.currency || "USD",
        default_hourly_rate:
          shop.default_hourly_rate != null
            ? Number(shop.default_hourly_rate)
            : 50,
        default_markup_pct:
          shop.default_markup_pct != null
            ? Number(shop.default_markup_pct)
            : 20,
        theme: shop.theme || "system",
      });
      setStep(1);
    }
  }, [shop]);

  // Markup helper state
  const [showMarkupHelper, setShowMarkupHelper] = useState(false);
  const [markupHelperInputs, setMarkupHelperInputs] = useState({
    materials: 300,
    hours: 8,
    hourly_rate: 50,
    desired_profit: 300,
  });

  // Hourly rate helper state
  const [showHourlyHelper, setShowHourlyHelper] = useState(false);
  const [hourlyHelperInputs, setHourlyHelperInputs] = useState({
    personal_income: 70000,
    billable_hours_per_year: 1100,
    overhead_monthly: 1500,
    profit_margin_pct: 15,
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateMarkupHelper = (field, value) => {
    setMarkupHelperInputs((prev) => ({ ...prev, [field]: value }));
  };

  const updateHourlyHelper = (field, value) => {
    setHourlyHelperInputs((prev) => ({ ...prev, [field]: value }));
  };

  // Markup helper derived values
  const markupBaseCost =
    Number(markupHelperInputs.materials || 0) +
    Number(markupHelperInputs.hours || 0) *
      Number(markupHelperInputs.hourly_rate || 0);

  const markupSuggestedPct =
    markupBaseCost > 0
      ? (Number(markupHelperInputs.desired_profit || 0) / markupBaseCost) * 100
      : 0;

  // Hourly rate helper derived values
  const hhIncomePerHour =
    Number(hourlyHelperInputs.billable_hours_per_year || 0) > 0
      ? Number(hourlyHelperInputs.personal_income || 0) /
        Number(hourlyHelperInputs.billable_hours_per_year || 0)
      : 0;

  const hhOverheadPerHour =
    Number(hourlyHelperInputs.billable_hours_per_year || 0) > 0
      ? (Number(hourlyHelperInputs.overhead_monthly || 0) * 12) /
        Number(hourlyHelperInputs.billable_hours_per_year || 0)
      : 0;

  const hhBaseRate = hhIncomePerHour + hhOverheadPerHour;

  const hhRateWithProfit =
    hhBaseRate *
    (1 + Number(hourlyHelperInputs.profit_margin_pct || 0) / 100);

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        timezone: form.timezone,
        currency: form.currency,
        default_hourly_rate: form.default_hourly_rate,
        default_markup_pct: form.default_markup_pct,
        theme: form.theme,
      };

      const result = isEditMode
        ? await updateShop(payload)
        : await createShop(payload);

      onCompleted?.(result);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Failed to save shop";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={stepCardStyle}>
      <h3 style={{ marginTop: 0 }}>
        {isEditMode ? "Edit shop settings" : "Shop setup"}
      </h3>
      <p
        style={{
          fontSize: "0.85rem",
          color: "#6b7280",
          marginTop: "0.25rem",
        }}
      >
        {isEditMode
          ? "Adjust your shop’s defaults and configuration."
          : "Let&apos;s configure your shop so estimates, jobs, and workflows use sensible defaults."}
      </p>

      <p
        style={{
          marginTop: "0.75rem",
          fontSize: "0.8rem",
          color: "#9ca3af",
        }}
      >
        Step {step} of 3
      </p>

      {error && (
        <p style={{ color: "crimson", fontSize: "0.85rem" }}>Error: {error}</p>
      )}

      {/* STEP 1 – Basic identity */}
      {step === 1 && (
        <div
          style={{
            marginTop: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              Shop name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              style={{
                width: "100%",
                padding: "0.4rem 0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                fontSize: "0.9rem",
              }}
              placeholder="E.g. Silver Hollow Woodworks"
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.0rem",
              }}
            >
              Description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              style={{
                width: "100%",
                marginTop: "0.25rem",
                padding: "0.4rem 0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                fontSize: "0.9rem",
              }}
              placeholder="Short note about what you build."
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              Theme preference
            </label>
            <select
              value={form.theme}
              onChange={(e) => updateField("theme", e.target.value)}
              style={{
                width: "100%",
                padding: "0.4rem 0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                fontSize: "0.9rem",
              }}
            >
              <option value="system">Follow system</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      )}

      {/* STEP 2 – Region & currency */}
      {step === 2 && (
        <div
          style={{
            marginTop: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div>
            <label
  style={{
    display: "block",
    fontSize: "0.85rem",
    marginBottom: "0.25rem",
  }}
>
  Timezone
</label>
<select
  value={form.timezone}
  onChange={(e) => updateField("timezone", e.target.value)}
  style={{
    width: "100%",
    padding: "0.4rem 0.5rem",
    borderRadius: "0.5rem",
    border: "1px solid #d1d5db",
    fontSize: "0.9rem",
  }}
>
  {TIMEZONE_OPTIONS.map((tz) => (
    <option key={tz} value={tz}>
      {tz}
    </option>
  ))}
</select>
<p
  style={{
    margin: "0.25rem 0 0",
    fontSize: "0.75rem",
    color: "#6b7280",
  }}
>
  Used for deadlines, schedules, and time-based reports.
</p>

            <p
              style={{
                margin: "0.25rem 0 0",
                fontSize: "0.75rem",
                color: "#6b7280",
              }}
            >
              Used for deadlines, schedules, and time-based reports.
            </p>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              Currency
            </label>
            <input
              type="text"
              value={form.currency}
              onChange={(e) => updateField("currency", e.target.value)}
              style={{
                width: "100%",
                padding: "0.4rem 0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                fontSize: "0.9rem",
              }}
              placeholder="e.g. USD"
            />
            <p
              style={{
                margin: "0.25rem 0 0",
                fontSize: "0.75rem",
                color: "#6b7280",
              }}
            >
              This will be used for all pricing and reports.
            </p>
          </div>
        </div>
      )}

      {/* STEP 3 – Pricing & markup */}
      {step === 3 && (
        <div
          style={{
            marginTop: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {/* Hourly rate with helper */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              Default hourly rate
            </label>
            <input
              type="number"
              value={form.default_hourly_rate}
              onChange={(e) =>
                updateField("default_hourly_rate", Number(e.target.value))
              }
              style={{
                width: "100%",
                padding: "0.4rem 0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                fontSize: "0.9rem",
              }}
            />
            <button
              type="button"
              onClick={() => setShowHourlyHelper((s) => !s)}
              style={{
                marginTop: "0.35rem",
                padding: 0,
                border: "none",
                background: "transparent",
                fontSize: "0.8rem",
                color: "#2563eb",
                cursor: "pointer",
              }}
            >
              {showHourlyHelper
                ? "Hide hourly rate helper"
                : "Need help choosing an hourly rate?"}
            </button>

            {showHourlyHelper && (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  border: "1px dashed #d1d5db",
                  background: "#f9fafb",
                  fontSize: "0.8rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                    marginBottom: "0.25rem",
                  }}
                >
                  Hourly rate helper
                </div>
                <p style={{ margin: 0, color: "#6b7280" }}>
                  Your hourly rate should cover your income, shop overhead, and
                  a bit of profit so the business can grow.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "0.5rem",
                    marginTop: "0.35rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.15rem",
                      }}
                    >
                      Target personal income (per year)
                    </label>
                    <input
                      type="number"
                      value={hourlyHelperInputs.personal_income}
                      onChange={(e) =>
                        updateHourlyHelper(
                          "personal_income",
                          Number(e.target.value),
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "0.3rem 0.4rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #d1d5db",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.15rem",
                      }}
                    >
                      Billable hours per year
                    </label>
                    <input
                      type="number"
                      value={hourlyHelperInputs.billable_hours_per_year}
                      onChange={(e) =>
                        updateHourlyHelper(
                          "billable_hours_per_year",
                          Number(e.target.value),
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "0.3rem 0.4rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #d1d5db",
                      }}
                    />
                    <p
                      style={{
                        margin: "0.15rem 0 0",
                        fontSize: "0.7rem",
                        color: "#6b7280",
                      }}
                    >
                      Most solo shops realistically bill ~1,000–1,200 hours per
                      year.
                    </p>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.15rem",
                      }}
                    >
                      Monthly shop overhead
                    </label>
                    <input
                      type="number"
                      value={hourlyHelperInputs.overhead_monthly}
                      onChange={(e) =>
                        updateHourlyHelper(
                          "overhead_monthly",
                          Number(e.target.value),
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "0.3rem 0.4rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #d1d5db",
                      }}
                    />
                    <p
                      style={{
                        margin: "0.15rem 0 0",
                        fontSize: "0.7rem",
                        color: "#6b7280",
                      }}
                    >
                      Rent, tools, insurance, utilities, software, etc.
                    </p>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.15rem",
                      }}
                    >
                      Desired profit margin (%)
                    </label>
                    <input
                      type="number"
                      value={hourlyHelperInputs.profit_margin_pct}
                      onChange={(e) =>
                        updateHourlyHelper(
                          "profit_margin_pct",
                          Number(e.target.value),
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "0.3rem 0.4rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #d1d5db",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <p style={{ margin: 0 }}>
                    Income per hour:{" "}
                    <strong>${hhIncomePerHour.toFixed(2)}</strong>
                  </p>
                  <p style={{ margin: 0 }}>
                    Overhead per hour:{" "}
                    <strong>${hhOverheadPerHour.toFixed(2)}</strong>
                  </p>
                  <p style={{ margin: 0 }}>
                    Base rate (before profit):{" "}
                    <strong>${hhBaseRate.toFixed(2)}</strong>
                  </p>
                  <p style={{ margin: 0 }}>
                    With profit:{" "}
                    <strong>${hhRateWithProfit.toFixed(2)} / hr</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      "default_hourly_rate",
                      Number(hhRateWithProfit.toFixed(2)),
                    )
                  }
                  style={{
                    marginTop: "0.25rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  Use this hourly rate
                </button>
              </div>
            )}
          </div>

          {/* Markup with presets + helper */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              Default markup %
            </label>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="number"
                value={form.default_markup_pct}
                onChange={(e) =>
                  updateField("default_markup_pct", Number(e.target.value))
                }
                style={{
                  flex: "0 0 120px",
                  padding: "0.4rem 0.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.35rem",
                  fontSize: "0.75rem",
                }}
              >
                {[
                  { label: "Conservative (20%)", value: 20 },
                  { label: "Standard (35%)", value: 35 },
                  { label: "Aggressive (50%)", value: 50 },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() =>
                      updateField("default_markup_pct", preset.value)
                    }
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "999px",
                      border: "1px solid #d1d5db",
                      background: "#f9fafb",
                      cursor: "pointer",
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMarkupHelper((s) => !s)}
              style={{
                marginTop: "0.35rem",
                padding: 0,
                border: "none",
                background: "transparent",
                fontSize: "0.8rem",
                color: "#2563eb",
                cursor: "pointer",
              }}
            >
              {showMarkupHelper
                ? "Hide markup helper"
                : "Need help choosing a markup?"}
            </button>

            {showMarkupHelper && (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  border: "1px dashed #d1d5db",
                  background: "#f9fafb",
                  fontSize: "0.8rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                    marginBottom: "0.25rem",
                  }}
                >
                  Markup helper
                </div>
                <p style={{ margin: 0, color: "#6b7280" }}>
                  Think about a typical job: materials, time, and how much profit
                  you want to make on top of your costs.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.15rem",
                      }}
                    >
                      Materials cost
                    </label>
                    <input
                      type="number"
                      value={markupHelperInputs.materials}
                      onChange={(e) =>
                        updateMarkupHelper(
                          "materials",
                          Number(e.target.value),
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "0.3rem 0.4rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #d1d5db",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.15rem",
                      }}
                    >
                      Labor hours
                    </label>
                    <input
                      type="number"
                      value={markupHelperInputs.hours}
                      onChange={(e) =>
                        updateMarkupHelper("hours", Number(e.target.value))
                      }
                      style={{
                        width: "100%",
                        padding: "0.3rem 0.4rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #d1d5db",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.15rem",
                      }}
                    >
                      Hourly rate
                    </label>
                    <input
                      type="number"
                      value={markupHelperInputs.hourly_rate}
                      onChange={(e) =>
                        updateMarkupHelper(
                          "hourly_rate",
                          Number(e.target.value),
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "0.3rem 0.4rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #d1d5db",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.15rem",
                      }}
                    >
                      Desired profit on job
                    </label>
                    <input
                      type="number"
                      value={markupHelperInputs.desired_profit}
                      onChange={(e) =>
                        updateMarkupHelper(
                          "desired_profit",
                          Number(e.target.value),
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "0.3rem 0.4rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #d1d5db",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <p style={{ margin: 0 }}>
                    Estimated base cost:{" "}
                    <strong>${markupBaseCost.toFixed(2)}</strong>
                  </p>
                  <p style={{ margin: 0 }}>
                    To add about{" "}
                    <strong>${markupHelperInputs.desired_profit || 0}</strong>{" "}
                    profit on top of that, you&apos;d use roughly{" "}
                    <strong>
                      {Number.isFinite(markupSuggestedPct)
                        ? markupSuggestedPct.toFixed(1)
                        : "0.0"}
                      % markup
                    </strong>
                    .
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      "default_markup_pct",
                      Number(markupSuggestedPct.toFixed(1)),
                    )
                  }
                  style={{
                    marginTop: "0.25rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  Use this markup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer navigation buttons */}
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={step > 1 ? handleBack : undefined}
          disabled={step === 1 || saving}
          style={{
            padding: "0.3rem 0.7rem",
            borderRadius: "0.5rem",
            border: "1px solid #d1d5db",
            background: step === 1 ? "#f9fafb" : "#ffffff",
            cursor: step === 1 ? "default" : "pointer",
            fontSize: "0.8rem",
          }}
        >
          ← Back
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            style={{
              padding: "0.3rem 0.8rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: "0.3rem 0.8rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#16a34a",
              color: "#ffffff",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            {saving
              ? isEditMode
                ? "Saving…"
                : "Saving…"
              : isEditMode
              ? "Save changes"
              : "Finish setup"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ShopSetupWizard;
