// src/components/charts/BaseChart.jsx
import React from "react";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "../../theme/useTheme";

/**
 * Thin wrapper around ReactApexChart that:
 * - Reads light/dark mode from useTheme
 * - Applies reasonable defaults for grid, legend, axes
 */
export default function BaseChart({
  type,
  series,
  options = {},
  height = 260,
  width = "100%",
}) {
  const { isDark } = useTheme();

  const mergedOptions = {
    chart: {
      toolbar: { show: false },
      background: "transparent",
      ...options.chart,
    },
    theme: {
      mode: isDark ? "dark" : "light",
      ...options.theme,
    },
    legend: {
      labels: {
        colors: isDark ? "#e5e7eb" : "#4b5563",
      },
      ...options.legend,
    },
    xaxis: {
      labels: {
        style: {
          colors: isDark ? "#9ca3af" : "#6b7280",
        },
      },
      axisBorder: {
        color: "rgba(148,163,184,0.35)",
      },
      axisTicks: {
        color: "rgba(148,163,184,0.35)",
      },
      ...options.xaxis,
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#9ca3af" : "#6b7280",
        },
      },
      ...options.yaxis,
    },
    grid: {
      borderColor: "rgba(148,163,184,0.25)",
      strokeDashArray: 3,
      ...options.grid,
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      ...options.tooltip,
    },
    ...options,
  };

  return (
    <ReactApexChart
      type={type}
      series={series}
      options={mergedOptions}
      height={height}
      width={width}
    />
  );
}
