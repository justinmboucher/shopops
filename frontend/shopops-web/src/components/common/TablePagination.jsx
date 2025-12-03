import React from "react";

export default function TablePagination({
  page,
  pageCount,
  onPrev,
  onNext,
}) {
  if (pageCount <= 1) return null;

  return (
    <div className="table-pagination">
      <button
        type="button"
        className="btn btn-ghost table-pagination-btn"
        onClick={onPrev}
        disabled={page <= 1}
      >
        Prev
      </button>
      <span className="table-pagination-info">
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        className="btn btn-ghost table-pagination-btn"
        onClick={onNext}
        disabled={page >= pageCount}
      >
        Next
      </button>
    </div>
  );
}
