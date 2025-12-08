import React from "react";
import { X } from "lucide-react";

export default function ConfirmDeleteModal({
  open,
  title = "Delete",
  message = "Are you sure you want to delete this item?",
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onCancel}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white w-[560px] max-w-[92vw] rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
            onClick={onCancel}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-gray-700 mt-3">{message}</p>

        <div className="flex justify-end gap-3 mt-8">
          <button
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-[#EF4543] text-white hover:bg-[#e03b39]"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
