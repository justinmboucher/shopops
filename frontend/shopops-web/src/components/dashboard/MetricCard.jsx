// src/components/dashboard/MetricCard.jsx
import React from "react";
import BaseChart from "../charts/BaseChart";
import DashboardDropdownMenu from "./DashboardDropdownMenu";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

function TrendPill({ pct, isGood, isBad }) {
  if (pct == null || Number.isNaN(pct)) {
    return null;
  }

  const abs = Math.abs(pct).toFixed(1);
  let Icon = ArrowRight;
  if (pct > 0) Icon = TrendingUp;
  if (pct < 0) Icon = TrendingDown;

  let className = "metric-trend-pill metric-trend-pill--neutral";
  if (isGood) className = "metric-trend-pill metric-trend-pill--good";
  if (isBad) className = "metric-trend-pill metric-trend-pill--bad";

  return (
    <span className={className}>
      <span>{abs}%</span>
      <span className="metric-trend-pill-icon">
        <Icon size={16} strokeWidth={2.6} />
      </span>
    </span>
  );
}

export default function MetricCard({
  title,
  value, // big value on the right (e.g. "$5.42M")
  timeframe, // small text under the value (e.g. "Since last month")
  variant = "simple", // "radial" | "trend" | "simple"
  shortValueLabel, // center text for radial circle (e.g. "65k")
  trendPct,
  trendIsGood,
  trendIsBad,
  radialSeries,
  isFullscreen,
  onToggleFullscreen,
}) {
  // Progress bar logic for trend card
  let progressPct = 0;
  let progressClass = "metric-progress-fill";
  if (typeof trendPct === "number" && Number.isFinite(trendPct)) {
    const abs = Math.min(Math.abs(trendPct), 100);
    if (trendIsGood) {
      // If trend is good, fill by the % change (32% → 0.32 filled)
      progressPct = abs;
      progressClass = "metric-progress-fill metric-progress-fill--good";
    } else if (trendIsBad) {
      // If trend is bad, fill the "remaining" portion (5.7% down → 94.3% filled)
      progressPct = 100 - abs;
      progressClass = "metric-progress-fill metric-progress-fill--bad";
    } else {
      progressPct = abs;
      progressClass = "metric-progress-fill";
    }
  }

  return (
    <div className={`metric-card metric-card--${variant}`}>
      {/* Header: title + menu */}
      <div className="metric-card-header">
        <div className="metric-label metric-label--lg">{title}</div>
        <DashboardDropdownMenu
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
      </div>

      {variant === "radial" && (
        <div className="metric-card-body metric-card-body--radial">
          <div className="metric-radial">
            <BaseChart
              type="radialBar"
              series={radialSeries || [0]}
              options={{
                stroke: {
                  lineCap: "butt",
                },
                plotOptions: {
                  radialBar: {
                    hollow: {
                      size: "50%", // smaller hollow = thicker ring
                    },
                    track: {
                      background: "rgba(148,163,184,0.15)",
                      strokeWidth: "80%",
                    },
                    dataLabels: {
                      name: {
                        show: false,
                      },
                      value: {
                        color: "var(--color-text-primary)",
                        show: true,
                        fontSize: "16px",
                        fontWeight: 600,
                        offsetY: 4,
                        formatter: () =>
                          shortValueLabel != null ? shortValueLabel : value,
                      },
                    },
                  },
                },
                labels: [],
              }}
              height={180}
            />
          </div>
          <div className="metric-main metric-main--right">
            <div className="metric-value metric-value--xl">{value}</div>
            {timeframe && <div className="metric-timeframe">{timeframe}</div>}
          </div>
        </div>
      )}

      {variant === "trend" && (
        <div className="metric-card-body metric-card-body--trend">
          <div className="metric-trend-header">
            <div className="metric-trend-meta">
              <TrendPill
                pct={trendPct}
                isGood={trendIsGood}
                isBad={trendIsBad}
              />
            </div>
            <div className="metric-main metric-main--right">
              <div className="metric-value metric-value--xl">{value}</div>
              {timeframe && (
                <div className="metric-timeframe">{timeframe}</div>
              )}
            </div>
          </div>

          {progressPct > 0 && (
            <div className="metric-progress">
              <div className="metric-progress-bar">
                <div
                  className={progressClass}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {variant === "simple" && (
        <div className="metric-card-body">
          <div className="metric-main metric-main--left">
            <div className="metric-value">{value}</div>
            {timeframe && (
              <div className="metric-timeframe">{timeframe}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
