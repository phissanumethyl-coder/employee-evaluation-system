import React from "react";

export default function ConfirmModal({ open, title, message, confirmText, confirmType, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-msg">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>ยกเลิก</button>
          <button
            className={`btn ${confirmType === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
          >{confirmText || "ยืนยัน"}</button>
        </div>
      </div>
    </div>
  );
}
