// src/api/dashboard.js
import client from "./client";
import { fetchProjects } from "./projects";
import { fetchCustomers } from "./customers";
import { fetchInventory } from "./inventory";

const DAY_MS = 24 * 60 * 60 * 1000;

// ---------- helpers ----------

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function inRange(dateString, start, end) {
  const d = toDate(dateString);
  if (!d) return false;
  return d >= start && d < end;
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function pctChange(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  if (previous === 0) return null; // treated as "New" in the UI
  return ((current - previous) / previous) * 100;
}

function buildLast12MonthKeys(now = new Date()) {
  const keys = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    keys.push(`${year}-${month}`);
  }
  return keys;
}

function monthKeyFromDate(dateString) {
  const d = toDate(dateString);
  if (!d) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Normalize typical DRF list responses
function normalizeListResponse(response, key = null) {
  if (!response) return [];
  const data = response.data ?? response;

  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (key && data && Array.isArray(data[key])) return data[key];

  return [];
}

// ---------- main aggregator ----------

export async function fetchDashboardSummary() {
  const now = new Date();

  const currentStart = new Date(now.getTime() - 30 * DAY_MS);
  const previousEnd = currentStart;
  const previousStart = new Date(previousEnd.getTime() - 30 * DAY_MS);

  // --- SALES ---
  let sales = [];
  try {
    const salesResponse = await client.get("sales/"); // /api/sales/
    sales = normalizeListResponse(salesResponse);
  } catch (err) {
    console.error("[Dashboard] failed to load sales, using []", err);
    sales = [];
  }

  // --- OTHER DATA (projects, customers, inventory) ---
  const [projectsRaw, customersRaw, inventoryRaw] = await Promise.all([
    fetchProjects().catch((err) => {
      console.error("[Dashboard] failed to load projects, using []", err);
      return [];
    }),
    fetchCustomers().catch((err) => {
      console.error("[Dashboard] failed to load customers, using []", err);
      return [];
    }),
    fetchInventory().catch((err) => {
      console.error("[Dashboard] failed to load inventory, using []", err);
      return [];
    }),
  ]);

  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
  const customers = Array.isArray(customersRaw) ? customersRaw : [];
  const inventory = Array.isArray(inventoryRaw) ? inventoryRaw : [];

  // ---------- time-windowed subsets ----------

  const currentSales = sales.filter((s) =>
    inRange(s.sold_at || s.soldAt || s.created_at, currentStart, now)
  );
  const previousSales = sales.filter((s) =>
    inRange(
      s.sold_at || s.soldAt || s.created_at,
      previousStart,
      previousEnd
    )
  );

  const currentCustomers = customers.filter((c) =>
    inRange(c.created_at || c.createdAt, currentStart, now)
  );
  const previousCustomers = customers.filter((c) =>
    inRange(c.created_at || c.createdAt, previousStart, previousEnd)
  );

  const cancelledProjectsCurrent = projects.filter(
    (p) =>
      p.status === "cancelled" &&
      inRange(p.cancelled_at || p.updated_at || p.created_at, currentStart, now)
  );
  const cancelledProjectsPrevious = projects.filter(
    (p) =>
      p.status === "cancelled" &&
      inRange(
        p.cancelled_at || p.updated_at || p.created_at,
        previousStart,
        previousEnd
      )
  );

  const activeProjectsNow = projects.filter((p) => p.status === "active");

  // We don't have historical snapshots for active projects, so leave that trend as null
  const activeProjectsPrev = null;

  // ---------- totals ----------

  const totalOrdersCurrent = currentSales.length;
  const totalOrdersPrevious = previousSales.length;

  const totalRevenueCurrent = currentSales.reduce(
    (sum, s) => sum + safeNumber(s.price),
    0
  );
  const totalRevenuePrevious = previousSales.reduce(
    (sum, s) => sum + safeNumber(s.price),
    0
  );

  const newCustomersCurrent = currentCustomers.length;
  const newCustomersPrevious = previousCustomers.length;

  const cancelledOrdersCurrent = cancelledProjectsCurrent.length;
  const cancelledOrdersPrevious = cancelledProjectsPrevious.length;

  const totals = {
    totalOrders: totalOrdersCurrent,
    totalRevenue: totalRevenueCurrent,
    newCustomers: newCustomersCurrent,
    activeProjects: activeProjectsNow.length,
    cancelledOrders: cancelledOrdersCurrent,
  };

  const trends = {
    totalOrdersPctChange: pctChange(
      totalOrdersCurrent,
      totalOrdersPrevious
    ),
    totalRevenuePctChange: pctChange(
      totalRevenueCurrent,
      totalRevenuePrevious
    ),
    newCustomersPctChange: pctChange(
      newCustomersCurrent,
      newCustomersPrevious
    ),
    activeProjectsPctChange: activeProjectsPrev
      ? pctChange(activeProjectsNow.length, activeProjectsPrev)
      : null,
    cancelledOrdersPctChange: pctChange(
      cancelledOrdersCurrent,
      cancelledOrdersPrevious
    ),
  };

  // ---------- channels (Order Statistics donut) ----------

  const channelCounts = {};
  currentSales.forEach((s) => {
    const key = s.channel || "other";
    channelCounts[key] = (channelCounts[key] || 0) + 1;
  });

  const channels = Object.entries(channelCounts).map(
    ([channel, orders]) => ({ channel, orders })
  );

  // ---------- project status pie ----------

  const statusCounts = {};
  projects.forEach((p) => {
    const key = p.status || "unknown";
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  });

  const projectStatus = Object.entries(statusCounts).map(
    ([status, count]) => ({ status, count })
  );

  // ---------- sales by month (last 12 months) ----------

  const monthKeys = buildLast12MonthKeys(now);
  const revenueByMonth = {};
  sales.forEach((s) => {
    const key = monthKeyFromDate(s.sold_at || s.soldAt || s.created_at);
    if (!key) return;
    if (!monthKeys.includes(key)) return;
    revenueByMonth[key] =
      (revenueByMonth[key] || 0) + safeNumber(s.price);
  });

  const salesByMonth = monthKeys.map((key) => ({
    month: key,
    revenue: revenueByMonth[key] || 0,
  }));

  // ---------- revenue vs expenses (fees as expenses) ----------

  const revenueVsExpensesMap = {};
  sales.forEach((s) => {
    const key = monthKeyFromDate(s.sold_at || s.soldAt || s.created_at);
    if (!key) return;
    if (!monthKeys.includes(key)) return;
    const price = safeNumber(s.price);
    const fees = safeNumber(s.fees);
    if (!revenueVsExpensesMap[key]) {
      revenueVsExpensesMap[key] = { revenue: 0, expenses: 0 };
    }
    revenueVsExpensesMap[key].revenue += price;
    revenueVsExpensesMap[key].expenses += fees;
  });

  const revenueVsExpenses = monthKeys.map((key) => {
    const bucket = revenueVsExpensesMap[key] || {
      revenue: 0,
      expenses: 0,
    };
    return {
      month: key,
      revenue: bucket.revenue,
      expenses: bucket.expenses,
    };
  });

  // ---------- top products by revenue (last 30 days) ----------

  const productBuckets = {};
  currentSales.forEach((s) => {
    const key = s.template || s.project || s.id;
    const name =
      s.template_name ||
      s.project_name ||
      `Item #${s.id}`;
    if (!productBuckets[key]) {
      productBuckets[key] = {
        productName: name,
        unitsSold: 0,
        revenue: 0,
      };
    }
    productBuckets[key].unitsSold += 1;
    productBuckets[key].revenue += safeNumber(s.price);
  });

  const topProducts = Object.values(productBuckets)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  // ---------- low inventory (simple heuristic) ----------

  const LOW_QTY_THRESHOLD = 5;

  const lowInventory = inventory
    .filter((item) => safeNumber(item.quantity) < LOW_QTY_THRESHOLD)
    .slice(0, 10)
    .map((item) => ({
      itemName: item.name || item.itemName || "Item",
      category: item.inventoryType || item.category || "inventory",
      quantity: safeNumber(item.quantity),
      threshold: LOW_QTY_THRESHOLD,
    }));

  // ---------- recent activity feed ----------

  const activityEvents = [];

  currentSales.forEach((s) => {
    activityEvents.push({
      id: `sale-${s.id}`,
      type: "order",
      message: `Order ${s.id} sold via ${s.channel || "other"} for $${safeNumber(
        s.price
      ).toFixed(2)}`,
      timestamp: s.sold_at || s.created_at,
    });
  });

  currentCustomers.forEach((c) => {
    activityEvents.push({
      id: `customer-${c.id}`,
      type: "customer",
      message: `New customer: ${c.name || c.display_name || "Customer"}`,
      timestamp: c.created_at,
    });
  });

  cancelledProjectsCurrent.forEach((p) => {
    activityEvents.push({
      id: `project-${p.id}`,
      type: "project",
      message: `Project cancelled: ${p.name || p.title || `#${p.id}`}`,
      timestamp: p.cancelled_at || p.updated_at || p.created_at,
    });
  });

  activityEvents.sort((a, b) => {
    const da = toDate(a.timestamp);
    const db = toDate(b.timestamp);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return db - da;
  });

  const recentActivity = activityEvents.slice(0, 20);

  // ---------- final shape ----------

  return {
    totals,
    trends,
    channels,
    projectStatus,
    salesByMonth,
    revenueVsExpenses,
    topProducts,
    lowInventory,
    recentActivity,
  };
}
