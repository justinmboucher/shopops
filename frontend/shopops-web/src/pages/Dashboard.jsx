// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { fetchDashboardSummary } from "../api/dashboard";
import BaseChart from "../components/charts/BaseChart";
import MetricCard from "../components/dashboard/MetricCard";
import ChartCard from "../components/dashboard/ChartCard";

function formatMoney(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return `$${Number(amount).toFixed(2)}`;
}

function formatNumberShort(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

function formatMoneyShort(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
}

function buildTrend(pct, semantics = "higherGood") {
  if (pct == null || Number.isNaN(Number(pct))) {
    // If we have *any* current value but no previous baseline,
    // treat it as +100% for visualization purposes.
    const num = 100;
    const abs = Math.abs(num);
    const direction = "up";
    const label = `${abs.toFixed(1)}%`;

    return {
      label,
      isGood: true,
      isBad: false,
      pct: num,        // now the pill & bar will render
      direction,
    };
  }

  const num = Number(pct);
  if (!Number.isFinite(num)) {
    return {
      label: "—",
      isGood: false,
      isBad: false,
      pct: null,
      direction: null,
    };
  }

  if (num === 0) {
    return {
      label: "0.0%",
      isGood: false,
      isBad: false,
      pct: 0,
      direction: "flat",
    };
  }

  const abs = Math.abs(num);
  const direction = num > 0 ? "up" : "down";
  const label = `${abs.toFixed(1)}%`;

  let isGood = false;
  let isBad = false;

  if (semantics === "higherGood") {
    if (num > 0) isGood = true;
    if (num < 0) isBad = true;
  } else if (semantics === "lowerGood") {
    if (num < 0) isGood = true;
    if (num > 0) isBad = true;
  }

  return { label, isGood, isBad, pct: num, direction };
}

function toTitleCase(label) {
  if (!label) return "";
  return label
    .toString()
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [fullscreenCardId, setFullscreenCardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDashboardSummary();
        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        console.error("fetchDashboardSummary error:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load dashboard");
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

  const handleToggleFullscreen = (id) => {
    setFullscreenCardId((current) => (current === id ? null : id));
  };

  const isFullscreen = (id) => fullscreenCardId === id;

  const totals = summary?.totals ?? {};
  const trends = summary?.trends ?? {};

  const channels = Array.isArray(summary?.channels)
    ? summary.channels
    : [];

  const projectStatus = Array.isArray(summary?.projectStatus)
    ? summary.projectStatus
    : [];

  const salesByMonth = Array.isArray(summary?.salesByMonth)
    ? summary.salesByMonth
    : [];

  const revenueVsExpenses = Array.isArray(summary?.revenueVsExpenses)
    ? summary.revenueVsExpenses
    : [];

  const topProducts = Array.isArray(summary?.topProducts)
    ? summary.topProducts
    : [];

  const lowInventory = Array.isArray(summary?.lowInventory)
    ? summary.lowInventory
    : [];

  const recentActivity = Array.isArray(summary?.recentActivity)
    ? summary.recentActivity
    : [];

  // Loading / error states
  if (loading) {
    return (
      <div className="app-main">
        <div className={"dashboard" +
            (isAnyFullscreen ? " dashboard--fullscreen-active" : "")
            }>
          <div className="page-header">
            <h1 className="page-title"></h1>
            <p className="page-subtitle">
            </p>
          </div>
          <p>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-main">
        <div className="dashboard">
          <div className="page-header">
            <h1 className="page-title"></h1>
            <p className="page-subtitle">
            </p>
          </div>
          <p className="text-error" style={{ marginBottom: "0.75rem" }}>
            {error}
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ----- Metric cards (Row 1) -----
  
    const totalOrdersTrend = buildTrend(
    trends.totalOrdersPctChange,
    "higherGood"
  );
  const totalRevenueTrend = buildTrend(
    trends.totalRevenuePctChange,
    "higherGood"
  );
  const newCustomersTrend = buildTrend(
    trends.newCustomersPctChange,
    "higherGood"
  );
  const activeProjectsTrend = buildTrend(
    trends.activeProjectsPctChange,
    "higherGood"
  );
  const cancelledOrdersTrend = buildTrend(
    trends.cancelledOrdersPctChange,
    "lowerGood"
  );

  // Radial chart value: clamp abs pct change to [0, 100]
  const totalOrdersPct = Number(totalOrdersTrend.pct ?? 0);
  const radialValue = Number.isFinite(totalOrdersPct)
    ? Math.max(0, Math.min(100, Math.abs(totalOrdersPct)))
    : 0;

  const timeframeLabel = "In the last 30 days";

  const metricCards = [
    {
      id: "totalOrders",
      title: "Total Orders",
      variant: "radial",
      value: formatNumberShort(totals.totalOrders ?? 0),
      shortValue: formatNumberShort(totals.totalOrders ?? 0),
      timeframe: timeframeLabel,
      trend: totalOrdersTrend,
    },
    {
      id: "totalRevenue",
      title: "Total Revenue",
      variant: "trend",
      value: formatMoneyShort(totals.totalRevenue),
      timeframe: timeframeLabel,
      trend: totalRevenueTrend,
    },
    {
      id: "newCustomers",
      title: "New Customers",
      variant: "trend",
      value: formatNumberShort(totals.newCustomers ?? 0),
      timeframe: timeframeLabel,
      trend: newCustomersTrend,
    },
    {
      id: "activeProjects",
      title: "Active Projects",
      variant: "trend",
      value: formatNumberShort(totals.activeProjects ?? 0),
      timeframe: "Currently active",
      trend: activeProjectsTrend,
    },
    {
      id: "cancelledOrders",
      title: "Cancelled Orders",
      variant: "trend",
      value: formatNumberShort(totals.cancelledOrders ?? 0),
      timeframe: timeframeLabel,
      trend: cancelledOrdersTrend,
    },
  ];

  // ----- Charts data -----

  // Order stats (donut)
  const orderStatsSeries = channels.map((c) => c.orders ?? 0);
  const orderStatsLabels = channels.map((c) => c.channel ?? "Other");
  const totalOrdersForDonut = orderStatsSeries.reduce(
    (sum, v) => sum + (v ?? 0),
    0
  );

  // Project status (donut)
  const projectStatusSeries = projectStatus.map((s) => s.count ?? 0);
  const projectStatusLabels = projectStatus.map((s) => s.status ?? "Other");
  const totalProjectsForDonut = projectStatusSeries.reduce(
    (sum, v) => sum + (v ?? 0),
    0
  );

  // Sales by month (bar)
  const salesMonths = salesByMonth.map((m) => m.month);
  const salesValues = salesByMonth.map((m) => m.revenue ?? 0);

  const totalRevenue12m = salesValues.reduce(
    (sum, v) => sum + (v ?? 0),
    0
  );
  const avgRevenue12m =
    salesValues.length > 0
      ? totalRevenue12m / salesValues.length
      : 0;

  // Revenue vs expenses (line)
  const revExpMonths = revenueVsExpenses.map((m) => m.month);
  const revValues = revenueVsExpenses.map((m) => m.revenue ?? 0);
  const expValues = revenueVsExpenses.map((m) => m.expenses ?? 0);

  const totalRevenueAll = revValues.reduce(
    (sum, v) => sum + (v ?? 0),
    0
  );
  const totalExpensesAll = expValues.reduce(
    (sum, v) => sum + (v ?? 0),
    0
  );

  const isAnyFullscreen = Boolean(fullscreenCardId);
  const shouldHideNonFullscreen = (id) =>
    isAnyFullscreen && fullscreenCardId !== id;



  return (
    <div className="app-main">
      <div className="dashboard">
        <div className="page-header">
          <p className="page-subtitle">
          </p>
        </div>

        {/* Row 1 – Metric cards */}
        <div className="dashboard-metrics">
          {metricCards.map((card) =>
            shouldHideNonFullscreen(card.id) ? null : (
               <MetricCard
                key={card.id}
                id={card.id}
                title={card.title}
                value={card.value}
                timeframe={card.timeframe}
                variant={card.variant}
                shortValueLabel={card.shortValue}
                trendPct={card.trend.pct}
                trendIsGood={card.trend.isGood}
                trendIsBad={card.trend.isBad}
                radialSeries={
                  card.id === "totalOrders" ? [radialValue] : undefined
                }
                isFullscreen={isFullscreen(card.id)}
                onToggleFullscreen={() => handleToggleFullscreen(card.id)}
              />
            )
          )}
        </div>

        {/* Row 2 – Order stats + Project status */}
        {!shouldHideNonFullscreen("orderStats") ||
        !shouldHideNonFullscreen("projectStatus") ? (
          <div className="dashboard-grid-row dashboard-grid-row--2-1"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
              gap: "1.25rem",
              marginBottom: "1.25rem",
            }}
          >
            {!shouldHideNonFullscreen("orderStats") && (
              <ChartCard
                id="orderStats"
                title="Order Statistics"
                subtitle="Orders by channel – last 30 days"
                isFullscreen={isFullscreen("orderStats")}
                onToggleFullscreen={() =>
                  handleToggleFullscreen("orderStats")
                }
              >
                {orderStatsSeries.length === 0 ? (
                  <p style={{ fontSize: "0.9rem", color: "var(--steel-300)" }}>
                    No orders in the last 30 days.
                  </p>
                ) : (
                  <BaseChart
                    type="donut"
                    series={orderStatsSeries}
                    options={{
                      chart: {
                        foreColor: "var(--color-text-secondary)", // axes/labels use theme colors
                      },
                      labels: orderStatsLabels,
                      legend: { position: "bottom" },
                      dataLabels: { enabled: false }, // slice labels off; center labels below
                      stroke: { width: 4 },
                      plotOptions: {
                        pie: {
                          donut: {
                            size: "78%",
                            labels: {
                              show: true,
                              name: { show: false },
                              value: {
                                show: true,
                                fontSize: "40px",          // big center number
                                fontWeight: 700,
                                color: "var(--color-text-primary)",
                                offsetY: 14,
                                formatter: () => totalOrdersForDonut.toString(),
                              },
                              total: {
                                show: true,
                                label: "Total orders",
                                fontSize: "12px",
                                color: "var(--color-text-secondary)",
                                offsetY: 14,
                                formatter: () => totalOrdersForDonut.toString(),
                              },
                            },
                          },
                        },
                      },
                    }}
                    height={isFullscreen("orderStats") ? 420 : 320}
                  />

                )}
                <div className="chart-kpi-grid">
                  {channels.map((c, idx) => {
                    const label = toTitleCase(c.channel || "Other");
                    const color =
                      [
                        "#4F46E5",
                        "#0EA5E9",
                        "#10B981",
                        "#F59E0B",
                        "#EF4444",
                        "#EC4899",
                      ][idx % 6];

                    return (
                      <div
                        className="chart-kpi-item"
                        key={`channel-${c.channel || "other"}`}
                      >
                        <div
                          className="chart-kpi-colorbar"
                          style={{ backgroundColor: color }}
                        />
                        <div className="chart-kpi-label">{label}</div>
                        <div className="chart-kpi-value">
                          {c.orders ?? 0} orders
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ChartCard>
            )}

            {!shouldHideNonFullscreen("projectStatus") && (
              <ChartCard
                id="projectStatus"
                title="Project Status"
                subtitle="Current projects by status"
                isFullscreen={isFullscreen("projectStatus")}
                onToggleFullscreen={() =>
                  handleToggleFullscreen("projectStatus")
                }
              >
                {projectStatusSeries.length === 0 ? (
                  <p style={{ fontSize: "0.9rem", color: "var(--steel-300)" }}>
                    No active projects yet.
                  </p>
                ) : (
                  <BaseChart
                    type="donut"
                    series={projectStatusSeries}
                    options={{
                      chart: {
                        foreColor: "var(--color-text-secondary)",
                      },
                      labels: projectStatusLabels,
                      legend: { position: "bottom" },
                      dataLabels: { enabled: false },
                      stroke: { width: 4 },
                      plotOptions: {
                        pie: {
                          donut: {
                            size: "78%",
                            labels: {
                              show: true,
                              name: { show: false },
                              value: {
                                show: true,
                                fontSize: "40px",
                                fontWeight: 700,
                                color: "var(--color-text-primary)",
                                offsetY: 14,
                                formatter: () => totalProjectsForDonut.toString(),
                              },
                              total: {
                                show: true,
                                label: "Total projects",
                                fontSize: "12px",
                                color: "var(--color-text-secondary)",
                                offsetY: 14,
                                formatter: () => totalProjectsForDonut.toString(),
                              },
                            },
                          },
                        },
                      },
                    }}
                    height={isFullscreen("projectStatus") ? 420 : 320}
                  />
                )}
                <div className="chart-kpi-grid">
                  {projectStatus.map((s, idx) => {
                    const label = toTitleCase(s.status || "Unknown");
                    const color =
                      [
                        "#2563EB", // active
                        "#10B981", // completed
                        "#F59E0B", // cancelled
                      ][idx % 3];

                    return (
                      <div
                        className="chart-kpi-item"
                        key={`status-${s.status || "unknown"}`}
                      >
                        <div
                          className="chart-kpi-colorbar"
                          style={{ backgroundColor: color }}
                        />
                        <div className="chart-kpi-label">{label}</div>
                        <div className="chart-kpi-value">
                          {s.count ?? 0} projects
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ChartCard>
            )}
          </div>
        ) : null}

        {/* Row 3 – Sales by month + Revenue vs Expenses */}
        {!shouldHideNonFullscreen("salesByMonth") ||
        !shouldHideNonFullscreen("revenueVsExpenses") ? (
          <div className="dashboard-grid-row dashboard-grid-row--1-1"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "1.25rem",
              marginBottom: "1.25rem",
            }}
          >
            {!shouldHideNonFullscreen("salesByMonth") && (
              <ChartCard
                id="salesByMonth"
                title="Sales by Month"
                subtitle="Last 12 months"
                isFullscreen={isFullscreen("salesByMonth")}
                onToggleFullscreen={() =>
                  handleToggleFullscreen("salesByMonth")
                }
              >
                {salesValues.length === 0 ? (
                  <p style={{ fontSize: "0.9rem", color: "var(--steel-300)" }}>
                    No sales data yet.
                  </p>
                ) : (
                  <BaseChart
                    type="bar"
                    series={[
                      {
                        name: "Revenue",
                        data: salesValues,
                      },
                    ]}
                    options={{
                      chart: { foreColor: "var(--color-text-secondary)" },
                      xaxis: {
                        categories: salesMonths,
                      },
                    }}
                    height={isFullscreen("salesByMonth") ? 420 : 320}
                  />
                )}
                <div className="chart-kpi-grid">
                  <div className="chart-kpi-item">
                    <div className="chart-kpi-label">Total revenue (12 mo)</div>
                    <div className="chart-kpi-value">
                      {formatMoney(totalRevenue12m)}
                    </div>
                  </div>
                  <div className="chart-kpi-item">
                    <div className="chart-kpi-label">Avg per month</div>
                    <div className="chart-kpi-value">
                      {formatMoney(avgRevenue12m)}
                    </div>
                  </div>
                </div>
              </ChartCard>
            )}

            {!shouldHideNonFullscreen("revenueVsExpenses") && (
              <ChartCard
                id="revenueVsExpenses"
                title="Revenue vs Expenses"
                subtitle="Last 12 months"
                isFullscreen={isFullscreen("revenueVsExpenses")}
                onToggleFullscreen={() =>
                  handleToggleFullscreen("revenueVsExpenses")
                }
              >
                {revValues.length === 0 && expValues.length === 0 ? (
                  <p style={{ fontSize: "0.9rem", color: "var(--steel-300)" }}>
                    No revenue/expense data yet.
                  </p>
                ) : (
                  <BaseChart
                    type="line"
                    series={[
                      { name: "Revenue", data: revValues },
                      { name: "Expenses", data: expValues },
                    ]}
                    options={{
                      chart: { foreColor: "var(--color-text-secondary)" },
                      xaxis: {
                        categories: revExpMonths,
                      },
                      stroke: {
                        curve: "smooth",
                        width: 2,
                      },
                    }}
                    height={isFullscreen("revenueVsExpenses") ? 420 : 320}
                  />
                )}
                <div className="chart-kpi-grid">
                  <div className="chart-kpi-item">
                    <div className="chart-kpi-label">Total revenue</div>
                    <div className="chart-kpi-value">
                      {formatMoney(totalRevenueAll)}
                    </div>
                  </div>
                  <div className="chart-kpi-item">
                    <div className="chart-kpi-label">Total expenses</div>
                    <div className="chart-kpi-value">
                      {formatMoney(totalExpensesAll)}
                    </div>
                  </div>
                </div>
              </ChartCard>
            )}
          </div>
        ) : null}

        {/* Row 4 – Top products + Low inventory + Recent activity */}

        {/* Top products & Low inventory tables */}
        {!shouldHideNonFullscreen("topProducts") ||
        !shouldHideNonFullscreen("lowInventory") ? (
          <div className="dashboard-grid-row dashboard-grid-row--1-1"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "1.25rem",
              marginBottom: "1.25rem",
            }}
          >
            {!shouldHideNonFullscreen("topProducts") && (
              <ChartCard
                id="topProducts"
                title="Top Products by Revenue"
                subtitle="In the last 30 days"
                isFullscreen={isFullscreen("topProducts")}
                onToggleFullscreen={() =>
                  handleToggleFullscreen("topProducts")
                }
              >
                <div className="settings-card--table">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Units</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="table-empty-row"
                          >
                            No products in the last 30 days.
                          </td>
                        </tr>
                      ) : (
                        topProducts.map((p, idx) => (
                          <tr key={`${p.productName}-${idx}`}>
                            <td>{p.productName}</td>
                            <td>{p.unitsSold ?? "—"}</td>
                            <td>{formatMoney(p.revenue)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            )}

            {!shouldHideNonFullscreen("lowInventory") && (
              <ChartCard
                id="lowInventory"
                title="Low Inventory"
                subtitle="Items below threshold"
                isFullscreen={isFullscreen("lowInventory")}
                onToggleFullscreen={() =>
                  handleToggleFullscreen("lowInventory")
                }
              >
                <div className="settings-card--table">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Qty</th>
                        <th>Threshold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowInventory.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="table-empty-row"
                          >
                            No items are currently below their threshold.
                          </td>
                        </tr>
                      ) : (
                        lowInventory.map((item, idx) => (
                          <tr key={`${item.itemName}-${idx}`}>
                            <td>{item.itemName}</td>
                            <td>{item.category}</td>
                            <td>{item.quantity ?? "—"}</td>
                            <td>{item.threshold ?? "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            )}
          </div>
        ) : null}

        {/* Recent activity feed – full width */}
        {!shouldHideNonFullscreen("recentActivity") && (
          <ChartCard
            id="recentActivity"
            title="Recent Activity"
            subtitle="Last 30 days"
            isFullscreen={isFullscreen("recentActivity")}
            onToggleFullscreen={() =>
              handleToggleFullscreen("recentActivity")
            }
          >
            {recentActivity.length === 0 ? (
              <p style={{ fontSize: "0.9rem", color: "var(--steel-300)" }}>
                No recent activity yet.
              </p>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {recentActivity.map((event) => (
                  <li
                    key={event.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>{event.message}</span>
                    <span
                      style={{
                        color: "var(--steel-300)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </ChartCard>
        )}
      </div>
    </div>
  );
}
