import React, { useState } from "react";
/** Multi-select “Shift” modal */

export default function ShiftModal({ open, onClose, initial = [], onApply }) {
  const OPTIONS = ["7 AM - 11 AM", "11 AM - 3 PM", "3 PM - 8 PM", "8 PM - 0 AM"];
  const [picked, setPicked] = useState(initial);

  const toggle = (s) =>
    setPicked((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  if (!open) return null;
  return (
    <ModalShell>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">Select Shift</h3>
        <div className="flex flex-wrap gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`px-5 py-2 rounded-full border transition ${
                picked.includes(opt)
                  ? "bg-[#FBE7E7] border-[#FBE7E7] text-[#EF4543]"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="border-t mt-6 pt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(picked)}
            className="px-5 py-2 rounded-lg bg-[#EF4543] text-white hover:bg-[#e03b39]"
          >
            Apply Now
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
