import { useState, useMemo } from "react";

export default function useTablePagination(rows, pageSize = 10) {
  const [page, setPage] = useState(1);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(rows.length / pageSize)),
    [rows.length, pageSize]
  );

  // clamp current page if data shrinks
  const currentPage = Math.min(page, pageCount);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, currentPage, pageSize]);

  function goToPage(nextPage) {
      const target = Math.max(1, Math.min(pageCount, nextPage));
      return target;
  }

  function nextPage() {
    setPage((prev) => Math.min(pageCount, prev + 1));
  }

  function prevPage() {
    setPage((prev) => Math.max(1, prev - 1));
  }

  return { pagedRows, page: currentPage, pageCount, goToPage, nextPage, prevPage };
}
