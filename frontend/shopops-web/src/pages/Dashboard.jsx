// src/pages/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  // For now, these are static placeholders.
  // Later we can wire them to real API data.
  const metrics = [
    {
      label: "Active projects",
      value: 7,
      subtext: "Projects not yet delivered",
      trendLabel: "+2 this week",
      trendType: "up",
    },
    {
      label: "Open work orders",
      value: 12,
      subtext: "Tasks across all projects",
      trendLabel: "5 due in next 7 days",
      trendType: "warn",
    },
    {
      label: "Inventory value",
      value: "$3,420",
      subtext: "Materials + consumables on hand",
      trendLabel: "Est. at cost",
      trendType: "neutral",
    },
  ];

  const recentProjects = [
    {
      id: 1,
      name: "Custom Oak Bookshelf",
      client: "Taylor Family",
      status: "In progress",
      stage: "Assembly",
      due: "2025-12-10",
    },
    {
      id: 2,
      name: "Walnut Dining Table",
      client: "Riverstone Cafe",
      status: "In progress",
      stage: "Finishing",
      due: "2025-12-05",
    },
    {
      id: 3,
      name: "Maple Cutting Board Batch",
      client: "Market Stock",
      status: "Queued",
      stage: "Planning",
      due: "2025-12-18",
    },
  ];

  const inventorySnapshot = [
    {
      id: 1,
      name: "4/4 Walnut boards",
      type: "Material",
      available: "18 pcs",
      note: "Getting low",
      level: "warning",
    },
    {
      id: 2,
      name: "General-purpose epoxy",
      type: "Consumable",
      available: "3 kits",
      note: "Enough for current queue",
      level: "ok",
    },
    {
      id: 3,
      name: "120-grit sanding discs",
      type: "Consumable",
      available: "40 pcs",
      note: "Healthy stock",
      level: "ok",
    },
    {
      id: 4,
      name: "Table saw (PM2000)",
      type: "Equipment",
      available: "Operational",
      note: "Blade due for inspection",
      level: "attention",
    },
  ];

  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Quick view of your active work, upcoming deadlines, and inventory
          health.
        </p>
      </div>

      {/* Metrics row */}
      <div className="settings-grid" style={{ marginBottom: "1.5rem" }}>
        {metrics.map((metric) => (
          <div key={metric.label} className="settings-card">
            <div className="settings-card__body">
              <div
                style={{
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#6b7280",
                  marginBottom: "0.25rem",
                }}
              >
                {metric.label}
              </div>
              <div
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 600,
                  marginBottom: "0.2rem",
                }}
              >
                {metric.value}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#6b7280",
                }}
              >
                {metric.subtext}
              </div>
              {metric.trendLabel && (
                <div style={{ marginTop: "0.5rem" }}>
                  <MetricChip type={metric.trendType}>
                    {metric.trendLabel}
                  </MetricChip>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Second row: Active projects + Inventory snapshot */}
      <div className="settings-grid">
        {/* Active projects card */}
        <section className="settings-card">
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  marginBottom: "0.15rem",
                }}
              >
                Active projects
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                }}
              >
                Work currently in progress or queued.
              </div>
            </div>
            <Link
              to="/projects"
              style={{
                fontSize: "0.8rem",
                color: "#2563eb",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              View all projects →
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <p
              className="table-empty-row"
              style={{ padding: "0.75rem 0", margin: 0 }}
            >
              No active projects yet. Create a project to get started.
            </p>
          ) : (
            <div className="settings-card settings-card--table" style={{ margin: 0 }}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Stage</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>{project.client}</td>
                      <td>
                        <ProjectStatusBadge status={project.status} />
                      </td>
                      <td>{project.stage}</td>
                      <td>{formatDate(project.due)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Inventory snapshot card */}
        <section className="settings-card">
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  marginBottom: "0.15rem",
                }}
              >
                Inventory snapshot
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                }}
              >
                A few items worth watching from materials, consumables, and
                equipment.
              </div>
            </div>
            <Link
              to="/inventory/materials"
              style={{
                fontSize: "0.8rem",
                color: "#2563eb",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              View inventory →
            </Link>
          </div>

          {inventorySnapshot.length === 0 ? (
            <p
              className="table-empty-row"
              style={{ padding: "0.75rem 0", margin: 0 }}
            >
              No inventory items tracked yet. Add materials, consumables, or
              equipment.
            </p>
          ) : (
            <div className="settings-card settings-card--table" style={{ margin: 0 }}>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Available</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {inventorySnapshot.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        <TypeBadge type={item.type} />
                      </td>
                      <td>{item.available}</td>
                      <td
                        style={{
                          maxWidth: "260px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "0.85rem",
                          color: "#9ca3af",
                        }}
                      >
                        {item.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------- Small helper components ---------- */

function MetricChip({ type, children }) {
  let style = {};
  if (type === "up") {
    style = { background: "rgba(52, 211, 153, 0.12)", color: "#6ee7b7" };
  } else if (type === "warn") {
    style = { background: "rgba(245, 158, 11, 0.12)", color: "#fbbf24" };
  } else {
    style = { background: "rgba(148, 163, 184, 0.15)", color: "#e5e7eb" };
  }

  return (
    <span className="metric-chip" style={style}>
      {children}
    </span>
  );
}

function ProjectStatusBadge({ status }) {
  const norm = (status || "").toLowerCase();
  let className = "badge badge--muted";
  let label = status || "Unknown";

  if (norm.includes("progress")) {
    className = "badge badge--success";
  } else if (norm.includes("queue") || norm.includes("queued")) {
    className = "badge badge--warning";
  } else if (norm.includes("hold")) {
    className = "badge badge--danger";
  }

  return <span className={className}>{label}</span>;
}

function TypeBadge({ type }) {
  const norm = (type || "").toLowerCase();
  let className = "badge badge--muted";

  if (norm === "material") className = "badge badge--success";
  else if (norm === "consumable") className = "badge badge--warning";
  else if (norm === "equipment") className = "badge badge--muted";

  return <span className={className}>{type}</span>;
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

export default Dashboard;
