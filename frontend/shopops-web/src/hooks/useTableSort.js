import { useState, useMemo } from "react";

export default function useTableSort(rows, defaultColumn = null) {
  const [sortConfig, setSortConfig] = useState({
    column: defaultColumn,
    direction: "asc",
  });

  const sortedRows = useMemo(() => {
    if (!sortConfig.column) return rows;

    const sorted = [...rows].sort((a, b) => {
      const x = a[sortConfig.column];
      const y = b[sortConfig.column];

      if (x === null || x === undefined) return 1;
      if (y === null || y === undefined) return -1;

      if (typeof x === "number" && typeof y === "number") {
        return sortConfig.direction === "asc" ? x - y : y - x;
      }

      // string comparison
      return sortConfig.direction === "asc"
        ? String(x).localeCompare(String(y))
        : String(y).localeCompare(String(x));
    });

    return sorted;
  }, [rows, sortConfig]);

  function onSort(column) {
    setSortConfig((prev) => {
      if (prev.column === column) {
        const nextDir = prev.direction === "asc" ? "desc" : "asc";
        return { column, direction: nextDir };
      }
      return { column, direction: "asc" };
    });
  }

  return { sortedRows, sortConfig, onSort };
}
