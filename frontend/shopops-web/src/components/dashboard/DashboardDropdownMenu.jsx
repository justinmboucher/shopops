// src/components/dashboard/DashboardDropdownMenu.jsx
import React, { useEffect, useRef, useState } from "react";

export default function DashboardDropdownMenu({
  isFullscreen,
  onToggleFullscreen,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dashboard-menu" ref={ref}>
      <button
        type="button"
        className="icon-button dashboard-menu-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        ⋮
      </button>

      {open && (
        <div className="dashboard-menu-panel" role="menu">
          <button
            type="button"
            className="dashboard-menu-item"
            onClick={() => {
              onToggleFullscreen?.();
              setOpen(false);
            }}
          >
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
          <button type="button" className="dashboard-menu-item">
            View report
          </button>
          <button type="button" className="dashboard-menu-item">
            Export report
          </button>
          <button type="button" className="dashboard-menu-item">
            More actions…
          </button>
        </div>
      )}
    </div>
  );
}
