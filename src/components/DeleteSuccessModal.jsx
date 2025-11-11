import React, { useEffect } from "react";

export default function DeleteSuccessModal({
  open,
  text = "Delete Successful",
  onClose,
  autoCloseMs = 1200,
}) {
useEffect(() => {
  console.log("DeleteSuccessModal open =", open);
  if (!open) return;
  const t = setTimeout(onClose, autoCloseMs);
  return () => clearTimeout(t);
}, [open, onClose, autoCloseMs]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white w-[420px] max-w-[92vw] rounded-2xl shadow-xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-[#FFD5D5] flex items-center justify-center">
          <span className="text-[#EF4543] text-lg">✓</span>
        </div>
        <p className="text-gray-800 font-medium">{text}</p>
      </div>
    </div>
  );
}
