import React, { useState } from "react";

export default function SelectOrderStatusModal({ open, onClose, onApply }) {
  const [selected, setSelected] = useState("done"); 

  if (!open) return null;

  const statuses = [
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirm", label: "Đã xác nhận" },     
    { value: "deliver", label: "Đang giao" },       
    { value: "done",    label: "Hoàn thành" },     
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-pink-600">
          Cập nhật trạng thái đơn hàng
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                if (s.value === "paid") {
                  onApply("paid");
                } else {
                  setSelected(s.value);
                }
              }}
              className={`py-4 rounded-2xl font-semibold text-sm border-2 transition-all shadow-md ${
                (selected === s.value || (s.value === "paid" && false))
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-500 scale-105"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
  {s.label}
  {s.value === "paid" && <span className="ml-2">Money Bag</span>}
</button>
          ))}
        </div>
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-300 font-medium"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onApply(selected);
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg"
          >
            Áp dụng ngay
          </button>
        </div>
      </div>
    </div>
  );
}