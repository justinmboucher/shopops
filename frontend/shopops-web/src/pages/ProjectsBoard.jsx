// src/pages/ProjectsBoard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchProjects } from "../api/projects";

function normalizeStage(project) {
  // Try a few shapes: stage.name, stage_name, stage
  if (project.stage && typeof project.stage === "object") {
    return project.stage.name || project.stage.label || "Unassigned";
  }
  if (project.stage_name) return project.stage_name;
  if (project.stage_label) return project.stage_label;
  if (typeof project.stage === "string") return project.stage;
  return "Unassigned";
}

const DEFAULT_COLUMNS = [
  { key: "Intake", label: "Intake" },
  { key: "Design", label: "Design" },
  { key: "Build", label: "Build" },
  { key: "Finish", label: "Finish" },
  { key: "Delivered", label: "Delivered" },
  { key: "Unassigned", label: "Unassigned" },
];

function ProjectsBoard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simple filter/search controls (expand later if you want)
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProjects();
        if (!cancelled) {
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
        if (!cancelled) {
          setError(err.message || "Failed to load projects.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    let list = Array.isArray(projects) ? [...projects] : [];
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter((p) => {
        const haystack = [
          p.name,
          p.title,
          p.customer_name,
          p.client_name,
          p.reference,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      });
    }
    return list;
  }, [projects, search]);

  const columns = useMemo(() => {
    // Group projects by normalized stage
    const byStage = new Map();
    for (const p of filteredProjects) {
      const stage = normalizeStage(p);
      if (!byStage.has(stage)) byStage.set(stage, []);
      byStage.get(stage).push(p);
    }

    // Use default columns for common stages,
    // but also add any extra ones we discover.
    const stageKeys = new Set(
      filteredProjects.map((p) => normalizeStage(p) || "Unassigned"),
    );

    const baseColumns = [...DEFAULT_COLUMNS];

    // Add any unknown stage keys as extra columns at the end
    for (const key of stageKeys) {
      if (!baseColumns.some((col) => col.key === key)) {
        baseColumns.push({ key, label: key });
      }
    }

    return baseColumns.map((col) => ({
      ...col,
      projects: byStage.get(col.key) || [],
    }));
  }, [filteredProjects]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Projects board</h1>
        <p className="page-subtitle">
          Visual view of work in each stage, like a job traveler board for your
          shop.
        </p>
      </div>

      {/* Toolbar – match filters on other pages */}
      <div
        className="settings-card"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <input
          type="search"
          placeholder="Search projects by name, client, reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{
            maxWidth: "340px",
          }}
        />
        <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
          {filteredProjects.length} project
          {filteredProjects.length === 1 ? "" : "s"} shown
        </span>
      </div>

      {loading && (
        <div className="settings-card">
          <p className="inventory-empty" style={{ margin: 0 }}>
            Loading projects…
          </p>
        </div>
      )}

      {error && (
        <div className="settings-card">
          <p className="text-error" style={{ margin: 0 }}>
            {error}
          </p>
        </div>
      )}

      {!loading && !error && filteredProjects.length === 0 && (
        <div className="settings-card">
          <p className="inventory-empty" style={{ margin: 0 }}>
            No projects yet. Create a project to start filling the board.
          </p>
        </div>
      )}

      {!loading && !error && filteredProjects.length > 0 && (
        <div
          className="settings-card"
          style={{
            overflowX: "auto",
          }}
        >
          <div
            className="kanban-board"
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
              minWidth: "100%",
            }}
          >
            {columns.map((column) => (
              <KanbanColumn key={column.key} column={column} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ column }) {
  return (
    <section className="kanban-column">
      <header className="kanban-column-header">
        <div>
          <div className="kanban-column-title">{column.label}</div>
          <div className="kanban-column-count">
            {column.projects.length} project
            {column.projects.length === 1 ? "" : "s"}
          </div>
        </div>
      </header>

      <div className="kanban-column-body">
        {column.projects.length === 0 ? (
          <div className="kanban-column-empty">No projects in this stage.</div>
        ) : (
          column.projects.map((project) => (
            <KanbanCard key={project.id} project={project} />
          ))
        )}
      </div>
    </section>
  );
}

function KanbanCard({ project }) {
  const name = project.name || project.title || `Project #${project.id}`;
  const client =
    project.customer_name || project.client_name || project.customer || "";
  const value =
    project.total_value ||
    project.quoted_price ||
    project.estimated_value ||
    null;

  const due =
    project.due_date || project.deadline || project.delivery_date || null;

  return (
    <article className="kanban-card">
      <div className="kanban-card-title-row">
        <h3 className="kanban-card-title">{name}</h3>
      </div>

      {client && (
        <div className="kanban-card-line">
          <span className="kanban-card-label">Client</span>
          <span className="kanban-card-value">{client}</span>
        </div>
      )}

      {value != null && (
        <div className="kanban-card-line">
          <span className="kanban-card-label">Value</span>
          <span className="kanban-card-value">{formatMoney(value)}</span>
        </div>
      )}

      {due && (
        <div className="kanban-card-line">
          <span className="kanban-card-label">Due</span>
          <span className="kanban-card-value">{formatDate(due)}</span>
        </div>
      )}

      {project.status && (
        <div className="kanban-card-footer">
          <StatusBadge status={project.status} />
        </div>
      )}
    </article>
  );
}

function StatusBadge({ status }) {
  const norm = (status || "").toLowerCase();
  let className = "badge badge--muted";

  if (norm.includes("in progress")) className = "badge badge--success";
  else if (norm.includes("queued") || norm.includes("pending"))
    className = "badge badge--warning";
  else if (norm.includes("cancel") || norm.includes("hold"))
    className = "badge badge--danger";

  return <span className={className}>{status}</span>;
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function formatMoney(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return `$${Number(amount).toFixed(2)}`;
}

export default ProjectsBoard;
