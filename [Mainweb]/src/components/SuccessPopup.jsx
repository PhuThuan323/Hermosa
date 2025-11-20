import React from "react";

export default function SuccessPopup({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6 text-center">
        <div className="bg-[#FBE7E7] w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3">
          <span className="text-2xl text-green-600">✔</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Import Successful
        </h2>
        <button
          onClick={onClose}
          className="bg-[#EF4543] text-white px-5 py-2 rounded-lg hover:bg-[#e03b39]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
