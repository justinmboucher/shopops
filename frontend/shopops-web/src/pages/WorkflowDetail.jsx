import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import WorkflowStageWizard from "../components/workflows/WorkflowStageWizard";

function WorkflowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [stages, setStages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingWorkflow, setSavingWorkflow] = useState(false);
  const [error, setError] = useState(null);

  // editing fields for workflow
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // new stage form
  const [newStageName, setNewStageName] = useState("");
  const [newStageOwner, setNewStageOwner] = useState(""); // maps to role
  const [newStageTag, setNewStageTag] = useState(""); // maps to key
  const [creatingStage, setCreatingStage] = useState(false);

  // track which stage is being edited inline
  const [editingStageId, setEditingStageId] = useState(null);
  const [stageEdits, setStageEdits] = useState({}); // { [id]: { name, owner, tag } }

  // wizard open/close
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // -----------------------------
  // Load workflow + stages
  // -----------------------------
  useEffect(() => {
    let ignore = false;

    async function loadWorkflow() {
      try {
        setLoading(true);
        setError(null);
        const resp = await api.get(`/workflows/${id}/`);
        if (ignore) return;

        const wf = resp.data;
        setWorkflow(wf);
        setName(wf.name || "");
        setDescription(wf.description || "");
        setStages((wf.stages || []).slice().sort((a, b) => a.order - b.order));
      } catch (err) {
        if (ignore) return;
        console.error("Failed to load workflow", err);
        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            err.message ||
            "Failed to load workflow"
        );
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadWorkflow();
    return () => {
      ignore = true;
    };
  }, [id]);

  const refreshWorkflow = async () => {
    try {
      const resp = await api.get(`/workflows/${id}/`);
      const wf = resp.data;
      setWorkflow(wf);
      setName(wf.name || "");
      setDescription(wf.description || "");
      setStages((wf.stages || []).slice().sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error("Failed to refresh workflow", err);
    }
  };

  // -----------------------------
  // Save workflow (name/description)
  // -----------------------------
  const handleSaveWorkflow = async (e) => {
    e.preventDefault();
    if (!workflow) return;

    try {
      setSavingWorkflow(true);
      setError(null);
      const resp = await api.patch(`/workflows/${workflow.id}/`, {
        name: name.trim(),
        description: description.trim(),
      });
      setWorkflow(resp.data);
    } catch (err) {
      console.error("Failed to save workflow", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Failed to save workflow"
      );
    } finally {
      setSavingWorkflow(false);
    }
  };

  // -----------------------------
  // Stage helpers
  // -----------------------------
  const nextOrder =
    stages.length > 0 ? Math.max(...stages.map((s) => s.order)) + 1 : 1;

  const handleCreateStage = async (e) => {
    e.preventDefault();
    if (!newStageName.trim() || !workflow) return;
    try {
      setCreatingStage(true);
      setError(null);
      await api.post(`/workflows/${workflow.id}/stages/`, {
        name: newStageName.trim(),
        order: nextOrder,
        // map friendly fields -> API fields
        role: newStageOwner.trim(),
        key: newStageTag.trim(),
      });
      setNewStageName("");
      setNewStageOwner("");
      setNewStageTag("");
      await refreshWorkflow();
    } catch (err) {
      console.error("Failed to create stage", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Failed to create stage"
      );
    } finally {
      setCreatingStage(false);
    }
  };

  const beginEditStage = (stage) => {
    setEditingStageId(stage.id);
    setStageEdits((prev) => ({
      ...prev,
      [stage.id]: {
        name: stage.name,
        owner: stage.role || "",
        tag: stage.key || "",
      },
    }));
  };

  const cancelEditStage = (stageId) => {
    setEditingStageId((current) => (current === stageId ? null : current));
    setStageEdits((prev) => {
      const copy = { ...prev };
      delete copy[stageId];
      return copy;
    });
  };

  const handleStageEditChange = (stageId, field, value) => {
    setStageEdits((prev) => ({
      ...prev,
      [stageId]: {
        ...(prev[stageId] || {}),
        [field]: value,
      },
    }));
  };

  const saveStageEdits = async (stageId) => {
    const edits = stageEdits[stageId];
    if (!edits || !workflow) return;

    try {
      setError(null);
      await api.patch(`/workflows/${workflow.id}/stages/${stageId}/`, {
        name: edits.name.trim(),
        // map owner/tag back to API fields
        role: (edits.owner || "").trim(),
        key: (edits.tag || "").trim(),
      });
      await refreshWorkflow();
      cancelEditStage(stageId);
    } catch (err) {
      console.error("Failed to update stage", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Failed to update stage"
      );
    }
  };

  const deleteStage = async (stageId) => {
    if (!workflow) return;
    const confirmDelete = window.confirm(
      "Delete this stage? This cannot be undone."
    );
    if (!confirmDelete) return;
    try {
      setError(null);
      await api.delete(`/workflows/${workflow.id}/stages/${stageId}/`);
      await refreshWorkflow();
    } catch (err) {
      console.error("Failed to delete stage", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Failed to delete stage"
      );
    }
  };

  // -----------------------------
  // Render states
  // -----------------------------
  if (loading) {
    return (
      <main className="page">
        <h1>Workflow</h1>
        <p>Loading workflow…</p>
      </main>
    );
  }

  if (!workflow) {
    return (
      <main className="page">
        <h1>Workflow</h1>
        <p>Workflow not found.</p>
        <button className="btn" type="button" onClick={() => navigate("/workflows")}>
          Back to workflows
        </button>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>{workflow.name}</h1>
        <p>Design the stages this type of project moves through in your shop.</p>
      </header>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
          Error: {error}
        </div>
      )}

      {/* Workflow meta form */}
      <section style={{ marginBottom: "2rem" }}>
        <form onSubmit={handleSaveWorkflow}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="wf-name"
              style={{ display: "block", fontSize: "0.85rem", marginBottom: 4 }}
            >
              Workflow name
            </label>
            <input
              id="wf-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", maxWidth: 480, padding: "0.4rem 0.5rem" }}
            />
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="wf-description"
              style={{ display: "block", fontSize: "0.85rem", marginBottom: 4 }}
            >
              Description
            </label>
            <textarea
              id="wf-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ width: "100%", maxWidth: 640, padding: "0.4rem 0.5rem" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button type="submit" className="btn" disabled={savingWorkflow}>
              {savingWorkflow ? "Saving…" : "Save workflow"}
            </button>
            <button
              type="button"
              className="btn"
              style={{ backgroundColor: "#e5e7eb", color: "#111827" }}
              onClick={() => navigate("/workflows")}
            >
              Back to workflows
            </button>
          </div>
        </form>
      </section>

      {/* Stages editor */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Stages</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              Projects move left to right through these.
            </span>
            <button
              type="button"
              className="btn"
              style={{
                padding: "0.25rem 0.6rem",
                fontSize: "0.8rem",
                backgroundColor: "#f3f4f6",
                color: "#111827",
              }}
              onClick={() => setIsWizardOpen(true)}
            >
              Use wizard
            </button>
          </div>
        </div>

        {isWizardOpen && (
          <WorkflowStageWizard
            workflowId={workflow.id}
            existingStages={stages}
            onClose={() => setIsWizardOpen(false)}
            onStagesCreated={async () => {
              await refreshWorkflow();
            }}
          />
        )}

        {/* Stage list */}
        {stages.length === 0 ? (
          <p>
            No stages yet. Use the wizard to generate a workflow, or add your first stage
            manually.
          </p>
        ) : (
          <div
            style={{
              borderRadius: "0.75rem",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead
                style={{
                  backgroundColor: "#f3f4f6",
                  textAlign: "left",
                }}
              >
                <tr>
                  <th style={{ padding: "0.5rem 0.75rem", width: "3rem" }}>#</th>
                  <th style={{ padding: "0.5rem 0.75rem" }}>Stage name</th>
                  <th style={{ padding: "0.5rem 0.75rem" }}>
                    Owner / station (optional)
                  </th>
                  <th style={{ padding: "0.5rem 0.75rem" }}>
                    Internal tag (optional)
                  </th>
                  <th style={{ padding: "0.5rem 0.75rem", width: "7rem" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stages.map((stage) => {
                  const isEditing = editingStageId === stage.id;
                  const edits = stageEdits[stage.id] || {
                    name: stage.name,
                    owner: stage.role || "",
                    tag: stage.key || "",
                  };

                  return (
                    <tr key={stage.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "0.5rem 0.75rem" }}>{stage.order}</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={edits.name}
                            onChange={(e) =>
                              handleStageEditChange(stage.id, "name", e.target.value)
                            }
                            style={{ width: "100%", padding: "0.25rem 0.4rem" }}
                          />
                        ) : (
                          stage.name
                        )}
                      </td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={edits.owner}
                            onChange={(e) =>
                              handleStageEditChange(stage.id, "owner", e.target.value)
                            }
                            style={{ width: "100%", padding: "0.25rem 0.4rem" }}
                            placeholder="Who owns this step? (e.g., CNC, sanding table)"
                          />
                        ) : stage.role ? (
                          stage.role
                        ) : (
                          <span style={{ color: "#9ca3af" }}>–</span>
                        )}
                      </td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={edits.tag}
                            onChange={(e) =>
                              handleStageEditChange(stage.id, "tag", e.target.value)
                            }
                            style={{ width: "100%", padding: "0.25rem 0.4rem" }}
                            placeholder="Short label for filters/automation"
                          />
                        ) : stage.key ? (
                          stage.key
                        ) : (
                          <span style={{ color: "#9ca3af" }}>–</span>
                        )}
                      </td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>
                        {isEditing ? (
                          <div style={{ display: "flex", gap: "0.25rem" }}>
                            <button
                              type="button"
                              className="btn"
                              style={{
                                padding: "0.25rem 0.5rem",
                                fontSize: "0.8rem",
                              }}
                              onClick={() => saveStageEdits(stage.id)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="btn"
                              style={{
                                padding: "0.25rem 0.5rem",
                                fontSize: "0.8rem",
                                backgroundColor: "#e5e7eb",
                                color: "#111827",
                              }}
                              onClick={() => cancelEditStage(stage.id)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "0.25rem" }}>
                            <button
                              type="button"
                              className="btn"
                              style={{
                                padding: "0.25rem 0.5rem",
                                fontSize: "0.8rem",
                              }}
                              onClick={() => beginEditStage(stage)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn"
                              style={{
                                padding: "0.25rem 0.5rem",
                                fontSize: "0.8rem",
                                backgroundColor: "#fee2e2",
                                color: "#b91c1c",
                              }}
                              onClick={() => deleteStage(stage.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add new stage manually */}
        <form onSubmit={handleCreateStage}>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Add a new stage
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr auto",
              gap: "0.5rem",
              alignItems: "center",
              maxWidth: 800,
            }}
          >
            <input
              type="text"
              placeholder="Stage name (e.g., Design, Cutting, Finishing)"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              style={{ padding: "0.25rem 0.4rem" }}
            />
            <input
              type="text"
              placeholder="Owner / station (optional)"
              value={newStageOwner}
              onChange={(e) => setNewStageOwner(e.target.value)}
              style={{ padding: "0.25rem 0.4rem" }}
            />
            <input
              type="text"
              placeholder="Internal tag (optional)"
              value={newStageTag}
              onChange={(e) => setNewStageTag(e.target.value)}
              style={{ padding: "0.25rem 0.4rem" }}
            />
            <button type="submit" className="btn" disabled={creatingStage}>
              {creatingStage ? "Adding…" : "Add stage"}
            </button>
          </div>
          <p style={{ marginTop: "0.35rem", fontSize: "0.8rem", color: "#6b7280" }}>
            This will be stage #{nextOrder}. You can reorder stages later when we
            add drag-and-drop.
          </p>
        </form>
      </section>
    </main>
  );
}

export default WorkflowDetail;
