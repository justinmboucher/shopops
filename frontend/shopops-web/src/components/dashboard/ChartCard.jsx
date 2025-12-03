// src/components/dashboard/ChartCard.jsx
import React from "react";
import DashboardDropdownMenu from "./DashboardDropdownMenu";

/**
 * Generic card wrapper for charts / tables on the dashboard.
 * Uses `.panel` styles from index.css.
 */
export default function ChartCard({
  title,
  subtitle,
  children,
  isFullscreen,
  onToggleFullscreen,
}) {
  return (
    <div className={"panel chart-card" +
    (isFullscreen ? " chart-card--fullscreen" : "")
       }>
      <div className="panel-header">
        <div>
          <div className="panel-title">{title}</div>
          {subtitle && (
            <div className="panel-subtitle">{subtitle}</div>
          )}
        </div>
        <DashboardDropdownMenu
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
      </div>
      <div>{children}</div>
    </div>
  );
}
