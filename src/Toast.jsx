import React, { useEffect } from "react";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className="toast-wrap">
      <div className="toast">
        <span className="toast-check">✓</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
