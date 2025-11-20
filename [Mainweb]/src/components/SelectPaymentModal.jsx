import React, { useState } from "react";

export default function SelectPaymentModal({ open, onClose, onApply }) {
  const [selected, setSelected] = useState("Paid");
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[360px] shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Select payment</h2>

        <div className="flex gap-4 mb-6">
          {["Paid", "Unpaid"].map((opt) => (
            <button
              key={opt}
              onClick={() => setSelected(opt)}
              className={`px-6 py-2 rounded-full border ${
                selected === opt
                  ? "bg-[#FBE7E7] text-[#EF4543] border-[#EF4543]"
                  : "border-gray-300 text-gray-700"
              }`}
            >
              {opt}
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
