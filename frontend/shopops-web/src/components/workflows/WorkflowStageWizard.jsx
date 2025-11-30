// src/components/workflows/WorkflowStageWizard.jsx
import { useState } from "react";
import api from "../../api/client";

// High-level craft type (what kind of making?)
const CRAFT_TYPES = [
  { value: "woodworking", label: "Woodworking" },
  { value: "resin_casting", label: "Resin / epoxy / casting" },
  { value: "sewing", label: "Sewing / textiles" },
  { value: "sculpting", label: "Sculpting / pottery / ceramics" },
  { value: "3d_printing", label: "3D printing" },
  { value: "laser_engraving", label: "Laser / CNC engraving" },
  { value: "general", label: "General maker / mixed" },
];

// Project subtypes per craft type
const PROJECT_SUBTYPES = {
  woodworking: [
    { value: "cutting_board", label: "Cutting boards" },
    { value: "furniture", label: "Furniture (tables, chairs, etc.)" },
    { value: "cabinets", label: "Cabinets / built-ins" },
    { value: "turning", label: "Turning (bowls, pens, etc.)" },
    { value: "cnc", label: "CNC work" },
    { value: "crafts", label: "Small crafts / decor" },
  ],
  resin_casting: [
    { value: "resin_board", label: "Resin / river boards" },
    { value: "art_pour", label: "Resin art pieces" },
    { value: "jewelry", label: "Jewelry / small castings" },
  ],
  sewing: [
    { value: "garments", label: "Garments / clothing" },
    { value: "bags", label: "Bags / totes" },
    { value: "quilts", label: "Quilts / blankets" },
    { value: "home_textiles", label: "Home textiles (pillows, curtains, etc.)" },
  ],
  sculpting: [
    { value: "statues", label: "Statues / figurines" },
    { value: "pottery", label: "Pottery / wheel work" },
    { value: "handbuilt", label: "Hand-built pieces" },
  ],
  "3d_printing": [
    { value: "prototypes", label: "Prototypes / functional parts" },
    { value: "miniatures", label: "Miniatures / models" },
    { value: "props", label: "Props / cosplay pieces" },
  ],
  laser_engraving: [
    { value: "signs", label: "Signs / plaques" },
    { value: "gift_items", label: "Gift items (tumblers, boards, etc.)" },
    { value: "labels", label: "Labels / tags" },
  ],
  general: [
    { value: "mixed", label: "Mixed projects" },
    { value: "custom_commission", label: "Custom commissions" },
  ],
};

// Detail level – how granular the workflow is
const DETAIL_LEVELS = [
  { value: "simple", label: "Simple (4–5 stages, high level)" },
  { value: "standard", label: "Standard (6–8 stages, good balance)" },
  { value: "detailed", label: "Detailed (10+ stages, very granular)" },
];

// ---- Stage suggestion logic ----
function buildSuggestedStages({ craftType, projectSubtype, detailLevel, choices }) {
  const woodBase = [
    { name: "Design & planning", owner: "Owner", key: "design" },
    { name: "Material prep", owner: "Shop", key: "prep" },
    { name: "Milling & cutting", owner: "Shop", key: "cutting" },
    { name: "Joinery & assembly", owner: "Shop", key: "assembly" },
    { name: "Sanding & surface prep", owner: "Shop", key: "sanding" },
    { name: "Finishing", owner: "Finishing", key: "finishing" },
    { name: "Cure & rest", owner: "Shop", key: "cure" },
    { name: "Hardware & final details", owner: "Shop", key: "hardware" },
    { name: "Quality check", owner: "Owner", key: "qa" },
    { name: "Packaging & delivery", owner: "Owner", key: "delivery" },
  ];

  const turningBase = [
    { name: "Blank prep", owner: "Shop", key: "blank_prep" },
    { name: "Rough turning", owner: "Shop", key: "rough_turn" },
    { name: "Drying / rest", owner: "Shop", key: "rest" },
    { name: "Final turning", owner: "Shop", key: "final_turn" },
    { name: "Sanding & finish", owner: "Finishing", key: "finish" },
    { name: "Quality check", owner: "Owner", key: "qa" },
    { name: "Packaging / handoff", owner: "Owner", key: "delivery" },
  ];

  const resinBase = [
    { name: "Design & layout", owner: "Owner", key: "design" },
    { name: "Form prep / sealing", owner: "Shop", key: "form_prep" },
    { name: "First pour", owner: "Shop", key: "pour1" },
    { name: "Second pour / fills", owner: "Shop", key: "pour2" },
    { name: "Cure", owner: "Shop", key: "cure" },
    { name: "Demold & flatten", owner: "Shop", key: "flatten" },
    { name: "Shaping & edge work", owner: "Shop", key: "shaping" },
    { name: "Sanding & polish", owner: "Finishing", key: "polish" },
    { name: "Topcoat / oil", owner: "Finishing", key: "topcoat" },
    { name: "Quality check", owner: "Owner", key: "qa" },
    { name: "Packaging & delivery", owner: "Owner", key: "delivery" },
  ];

  const sewingBase = [
    { name: "Pattern / measurements", owner: "Owner", key: "pattern" },
    { name: "Cutting fabric", owner: "Shop", key: "cutting" },
    { name: "Assembly / sewing", owner: "Shop", key: "sewing" },
    { name: "Pressing / finishing", owner: "Shop", key: "pressing" },
    { name: "Fitting / adjustments", owner: "Owner", key: "fitting" },
    { name: "Final press & cleanup", owner: "Shop", key: "final" },
    { name: "Quality check", owner: "Owner", key: "qa" },
    { name: "Packaging & delivery", owner: "Owner", key: "delivery" },
  ];

  const sculptBase = [
    { name: "Concept & sketch", owner: "Owner", key: "concept" },
    { name: "Armature / form", owner: "Shop", key: "armature" },
    { name: "Primary sculpting", owner: "Shop", key: "primary" },
    { name: "Detail sculpting", owner: "Shop", key: "details" },
    { name: "Drying / firing", owner: "Shop", key: "dry" },
    { name: "Glaze / surface treatment", owner: "Finishing", key: "glaze" },
    { name: "Final firing / cure", owner: "Shop", key: "cure" },
    { name: "Quality check", owner: "Owner", key: "qa" },
    { name: "Packaging & delivery", owner: "Owner", key: "delivery" },
  ];

  const printingBase = [
    { name: "Model prep / slicing", owner: "Owner", key: "model_prep" },
    { name: "Printer setup", owner: "Shop", key: "setup" },
    { name: "Print run", owner: "Shop", key: "print" },
    { name: "Support removal", owner: "Shop", key: "supports" },
    { name: "Sanding / cleanup", owner: "Shop", key: "cleanup" },
    { name: "Priming / painting", owner: "Finishing", key: "paint" },
    { name: "Quality check", owner: "Owner", key: "qa" },
    { name: "Packaging & delivery", owner: "Owner", key: "delivery" },
  ];

  const laserBase = [
    { name: "Design / layout", owner: "Owner", key: "design" },
    { name: "Material prep", owner: "Shop", key: "prep" },
    { name: "Engraving / cutting", owner: "Shop", key: "engrave" },
    { name: "Cleaning / masking removal", owner: "Shop", key: "cleanup" },
    { name: "Paint fill / finishing", owner: "Finishing", key: "finish" },
    { name: "Hardware / assembly", owner: "Shop", key: "hardware" },
    { name: "Quality check", owner: "Owner", key: "qa" },
    { name: "Packaging & delivery", owner: "Owner", key: "delivery" },
  ];

  const generalBase = [
    { name: "Intake & requirements", owner: "Owner", key: "intake" },
    { name: "Design & planning", owner: "Owner", key: "design" },
    { name: "Material prep", owner: "Shop", key: "prep" },
    { name: "Build / fabrication", owner: "Shop", key: "build" },
    { name: "Refinement / sanding", owner: "Shop", key: "refine" },
    { name: "Finishing", owner: "Finishing", key: "finish" },
    { name: "Quality check", owner: "Owner", key: "qa" },
    { name: "Packaging & delivery", owner: "Owner", key: "delivery" },
  ];

  let base;

  switch (craftType) {
    case "woodworking":
      if (projectSubtype === "turning") {
        base = turningBase;
      } else {
        base = woodBase;
      }
      break;
    case "resin_casting":
      base = resinBase;
      break;
    case "sewing":
      base = sewingBase;
      break;
    case "sculpting":
      base = sculptBase;
      break;
    case "3d_printing":
      base = printingBase;
      break;
    case "laser_engraving":
      base = laserBase;
      break;
    case "general":
    default:
      base = generalBase;
  }

  // Trim / expand based on detail level
  let stages;
  if (detailLevel === "simple") {
    stages = [
      base.find((s) => s.key === "design") || base[0],
      base.find((s) => s.key === "prep") || base[1] || base[0],
      base.find((s) => s.key === "build") ||
        base.find((s) => s.key === "cutting") ||
        base[2] ||
        base[0],
      base.find((s) => s.key === "finish") ||
        base.find((s) => s.key === "finishing") ||
        base[3] ||
        base[0],
      base.find((s) => s.key === "delivery") ||
        base[base.length - 1] ||
        base[0],
    ].filter(Boolean);
  } else if (detailLevel === "standard") {
    stages = base.slice(0, 7);
  } else {
    // detailed = everything
    stages = base.slice();
  }

  const { hasClientProof, includesBatching, includesQC, includesDelivery } =
    choices || {};

  // Client proof
  if (hasClientProof) {
    const exists = stages.some((s) => s.key === "client_proof");
    if (!exists) {
      stages.splice(1, 0, {
        name: "Client proof & approval",
        owner: "Owner",
        key: "client_proof",
      });
    }
  }

  // Batching
  if (includesBatching) {
    stages = stages.map((s) =>
      s.key === "build" || s.key === "cutting"
        ? { ...s, name: `${s.name} (batch)`, key: s.key }
        : s
    );
  }

  // QC
  if (includesQC) {
    const hasQC = stages.some((s) => s.key === "qa");
    if (!hasQC) {
      stages.splice(stages.length - 1, 0, {
        name: "Quality check",
        owner: "Owner",
        key: "qa",
      });
    }
  } else {
    stages = stages.filter((s) => s.key !== "qa");
  }

  // Delivery
  if (!includesDelivery) {
    stages = stages.filter((s) => s.key !== "delivery");
  }

  // Dedup by key/name
  const seen = new Set();
  const deduped = [];
  for (const s of stages) {
    const k = s.key || s.name.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      deduped.push(s);
    }
  }

  // Map to API shape (role = owner)
  return deduped.map((s) => ({
    name: s.name,
    role: s.owner || "",
    key: s.key || "",
  }));
}

function WorkflowStageWizard({ workflowId, existingStages, onClose, onStagesCreated }) {
  const [step, setStep] = useState(0);

  const [craftType, setCraftType] = useState("woodworking");
  const [projectSubtype, setProjectSubtype] = useState("");

  const [detailLevel, setDetailLevel] = useState("standard");

  const [hasClientProof, setHasClientProof] = useState(false);
  const [includesBatching, setIncludesBatching] = useState(false);
  const [includesQC, setIncludesQC] = useState(true);
  const [includesDelivery, setIncludesDelivery] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const subtypeOptions = PROJECT_SUBTYPES[craftType] || [];
  const effectiveSubtype = projectSubtype || (subtypeOptions[0]?.value ?? null);

  const suggestedStages = buildSuggestedStages({
    craftType,
    projectSubtype: effectiveSubtype,
    detailLevel,
    choices: {
      hasClientProof,
      includesBatching,
      includesQC,
      includesDelivery,
    },
  });

  const baseOrder =
    existingStages && existingStages.length
      ? Math.max(...existingStages.map((s) => s.order || 0)) + 1
      : 1;

  const handleCreateStages = async () => {
    if (!suggestedStages.length) return;
    try {
      setSubmitting(true);
      setError(null);

      for (let i = 0; i < suggestedStages.length; i++) {
        const s = suggestedStages[i];
        await api.post(`/workflows/${workflowId}/stages/`, {
          name: s.name,
          order: baseOrder + i,
          role: s.role || "",
          key: s.key || "",
        });
      }

      if (onStagesCreated) {
        await onStagesCreated();
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error("Wizard failed to create stages", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Failed to create stages"
      );
      setSubmitting(false);
    }
  };

  const canGoNext =
    (step === 0 && !!craftType) ||
    (step === 1 && !!effectiveSubtype) ||
    step >= 2;

  return (
    <div
      style={{
        borderRadius: "0.75rem",
        border: "1px solid #d1d5db",
        background: "#ffffff",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
            Workflow stage wizard
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
            Answer a few questions and we&apos;ll suggest a starting layout of stages.
          </p>
        </div>
        <button
          type="button"
          className="btn"
          style={{
            backgroundColor: "#e5e7eb",
            color: "#111827",
            padding: "0.25rem 0.6rem",
            fontSize: "0.8rem",
          }}
          onClick={onClose}
        >
          Close
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "0.75rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.5rem",
            backgroundColor: "#fef2f2",
            color: "#b91c1c",
            fontSize: "0.85rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Step content */}
      {step === 0 && (
        <div>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            What kind of craft is this workflow for?
          </h3>
          <div style={{ display: "grid", gap: "0.4rem", marginBottom: "0.75rem" }}>
            {CRAFT_TYPES.map((opt) => (
              <label
                key={opt.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="craftType"
                  value={opt.value}
                  checked={craftType === opt.value}
                  onChange={() => {
                    setCraftType(opt.value);
                    setProjectSubtype("");
                  }}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            What kind of projects use this workflow?
          </h3>
          {subtypeOptions.length === 0 ? (
            <p style={{ fontSize: "0.9rem" }}>
              No specific subtypes for this craft yet. We&apos;ll use a general pattern.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "0.4rem", marginBottom: "0.75rem" }}>
              {subtypeOptions.map((opt) => (
                <label
                  key={opt.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="projectSubtype"
                    value={opt.value}
                    checked={effectiveSubtype === opt.value}
                    onChange={() => setProjectSubtype(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            How detailed do you want this workflow?
          </h3>
          <div style={{ display: "grid", gap: "0.4rem", marginBottom: "0.75rem" }}>
            {DETAIL_LEVELS.map((opt) => (
              <label
                key={opt.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="detailLevel"
                  value={opt.value}
                  checked={detailLevel === opt.value}
                  onChange={() => setDetailLevel(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Tell us a bit about your process
          </h3>
          <div
            style={{
              display: "grid",
              gap: "0.5rem",
              marginBottom: "0.75rem",
              fontSize: "0.9rem",
            }}
          >
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
              <input
                type="checkbox"
                checked={hasClientProof}
                onChange={(e) => setHasClientProof(e.target.checked)}
              />
              <span>
                I usually send a <strong>design proof to clients</strong> and wait for
                approval before I start building.
              </span>
            </label>

            <label style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
              <input
                type="checkbox"
                checked={includesBatching}
                onChange={(e) => setIncludesBatching(e.target.checked)}
              />
              <span>
                I often <strong>batch similar tasks</strong> (e.g., cut parts for
                multiple projects at once).
              </span>
            </label>

            <label style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
              <input
                type="checkbox"
                checked={includesQC}
                onChange={(e) => setIncludesQC(e.target.checked)}
              />
              <span>
                I want a dedicated <strong>quality check</strong> stage near the end.
              </span>
            </label>

            <label style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
              <input
                type="checkbox"
                checked={includesDelivery}
                onChange={(e) => setIncludesDelivery(e.target.checked)}
              />
              <span>
                I want a final <strong>packaging / delivery / pickup</strong> stage.
              </span>
            </label>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
            Suggested stages
          </h3>
          {suggestedStages.length === 0 ? (
            <p style={{ fontSize: "0.9rem" }}>
              No stages could be generated from these answers (which is weird).
            </p>
          ) : (
            <>
              <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                Here&apos;s the workflow we&apos;d start with. You can always rename or
                reorder stages later.
              </p>
              <ol
                style={{
                  fontSize: "0.9rem",
                  paddingLeft: "1.25rem",
                  marginBottom: "0.75rem",
                }}
              >
                {suggestedStages.map((s, idx) => (
                  <li key={idx} style={{ marginBottom: "0.2rem" }}>
                    <strong>{s.name}</strong>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}

      {/* Step controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.5rem",
          marginTop: "0.75rem",
        }}
      >
        <div>
          {step > 0 && (
            <button
              type="button"
              className="btn"
              style={{
                backgroundColor: "#e5e7eb",
                color: "#111827",
                padding: "0.35rem 0.7rem",
                fontSize: "0.85rem",
              }}
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            >
              Back
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {step < 4 && (
            <button
              type="button"
              className="btn"
              style={{
                padding: "0.35rem 0.7rem",
                fontSize: "0.85rem",
              }}
              onClick={() => {
                if (!canGoNext) return;
                setStep((prev) => Math.min(4, prev + 1));
              }}
              disabled={!canGoNext}
            >
              Next
            </button>
          )}
          {step === 4 && (
            <button
              type="button"
              className="btn"
              style={{
                padding: "0.35rem 0.7rem",
                fontSize: "0.85rem",
              }}
              onClick={handleCreateStages}
              disabled={submitting || suggestedStages.length === 0}
            >
              {submitting ? "Creating…" : "Create stages"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkflowStageWizard;
