// src/components/common/Modal.jsx
import React from "react";

function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;

  const handleBackdropClick = (e) => {
    // Only close if they click directly on the backdrop, not inside the dialog
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-dialog">
        <header className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="modal-body">{children}</div>

        <footer className="modal-footer">
          {footer || (
            <button
              type="button"
              className="btn"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export default Modal;
