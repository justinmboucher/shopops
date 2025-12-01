// src/context/ToastProvider.jsx
import React, { useCallback, useState } from "react";
import ToastContext from "./ToastContext";

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const {
        message,
        type = "info", // "success" | "error" | "info" | "warning"
        duration = 4000, // ms; null = sticky
      } = typeof options === "string"
        ? { message: options }
        : options || {};

      if (!message) return;

      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration !== null) {
        window.setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const value = { showToast };

  const getToastStyles = (type) => {
    switch (type) {
      case "success":
        return {
          background: "#dcfce7",
          borderColor: "#22c55e",
          color: "#14532d",
        };
      case "error":
        return {
          background: "#fee2e2",
          borderColor: "#ef4444",
          color: "#7f1d1d",
        };
      case "warning":
        return {
          background: "#fef9c3",
          borderColor: "#eab308",
          color: "#78350f",
        };
      case "info":
      default:
        return {
          background: "#e0f2fe",
          borderColor: "#3b82f6",
          color: "#1e3a8a",
        };
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              style={{
                maxWidth: "320px",
                boxShadow: "0 10px 25px rgba(15,23,42,0.25)",
                borderRadius: "0.75rem",
                borderWidth: "1px",
                borderStyle: "solid",
                padding: "0.6rem 0.8rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                fontSize: "0.85rem",
                pointerEvents: "auto",
                ...styles,
              }}
            >
              <div style={{ flex: 1 }}>{toast.message}</div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  lineHeight: 1,
                  padding: 0,
                  marginLeft: "0.25rem",
                  opacity: 0.8,
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
