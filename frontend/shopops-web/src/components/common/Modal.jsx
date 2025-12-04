// src/components/common/Modal.jsx
import React from "react";

/**
 * Generic app modal.
 *
 * Props:
 * - open: boolean
 * - title: string | ReactNode
 * - onClose: () => void
 * - children: form/content
 * - footer: ReactNode (buttons etc) – aligned right by default
 * - size: "sm" | "md" | "lg"
 * - variant: "default" | "primary" (primary = colored header bar)
 */
function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = "md",
  variant = "default",
}) {
  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const dialogClassName = [
    "modal-dialog",
    `modal-dialog--${size}`,
  ].join(" ");

  const headerClassName = [
    "modal-header",
    variant === "primary" ? "modal-header--primary" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={dialogClassName} role="dialog" aria-modal="true">
        <header className={headerClassName}>
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
            <button type="button" className="btn" onClick={onClose}>
              Close
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export default Modal;
