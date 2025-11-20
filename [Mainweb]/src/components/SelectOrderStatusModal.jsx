import React, { useState } from "react";

export default function SelectOrderStatusModal({ open, onClose, onApply }) {
  const [selected, setSelected] = useState("Delivered");
  if (!open) return null;

  const statuses = ["Delivered", "Pending", "Shipped", "Canceled"];

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[420px] shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Select Order Status</h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className={`px-6 py-2 rounded-full border ${
                selected === s
                  ? "bg-[#FBE7E7] text-[#EF4543] border-[#EF4543]"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            onApply(selected);
            onClose();
          }}
          className="w-full bg-[#EF4543] text-white font-medium py-2.5 rounded-lg"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}
