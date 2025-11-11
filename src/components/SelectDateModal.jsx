import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function SelectDateModal({ open, onClose, onApply }) {
  const [selectedDates, setSelectedDates] = useState([]);

  if (!open) return null;

  const handleDateClick = (date) => {
    const alreadySelected = selectedDates.find(
      (d) => d.toDateString() === date.toDateString()
    );
    if (alreadySelected) {
      setSelectedDates(selectedDates.filter((d) => d.toDateString() !== date.toDateString()));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg text-center">
        <h2 className="text-lg font-semibold mb-4">Select Delivery Date</h2>
        <Calendar
          onClickDay={handleDateClick}
          tileClassName={({ date }) =>
            selectedDates.some((d) => d.toDateString() === date.toDateString())
              ? "bg-[#FBE7E7] rounded-full"
              : ""
          }
        />
        <p className="text-sm text-gray-500 mt-4">
          *You can choose multiple dates
        </p>

        <button
          onClick={() => {
            onApply(selectedDates);
            onClose();
          }}
          className="mt-4 w-full bg-[#EF4543] text-white py-2 rounded-lg font-medium"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}
