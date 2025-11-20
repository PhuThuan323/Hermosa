// src/pages/Staff.jsx
import React, { useMemo, useState } from "react";
import { Search, Calendar } from "lucide-react";



/* ----------------------------- Page Component ----------------------------- */

export default function Staff() {

  // page-level date (defaults to today)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10); // yyyy-mm-dd
  });

  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([
    { id: "E001", name: "Võ Thanh Nhàn", shifts: ["7 AM - 11 AM"], salary: "2.000.000 đ", paid: true },
    { id: "E002", name: "Phú Thuận Trần", shifts: ["7 AM - 11 AM", "3 PM - 8 PM"], salary: "8.000.000 đ", paid: false },
    { id: "E003", name: "Trần Phú Thuận", shifts: ["11 AM - 3 PM"], salary: "6.000.000 đ", paid: true },
    { id: "E004", name: "Steve Rogers", shifts: ["3 PM - 8 PM"], salary: "5.500.000 đ", paid: true },
  ]);

  // which row is being edited
  const [editingRow, setEditingRow] = useState(null);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        r.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [rows, query]
  );

  const openShift = (row) => {
    setEditingRow(row);
    setShiftOpen(true);
  };
  const openPay = (row) => {
    setEditingRow(row);
    setPayOpen(true);
  };

  const applyShifts = (newShifts) => {
    setRows((prev) =>
      prev.map((r) => (r.id === editingRow.id ? { ...r, shifts: newShifts } : r))
    );
    setShiftOpen(false);
    setEditingRow(null);
  };

  const applyPaid = (paid) => {
    setRows((prev) =>
      prev.map((r) => (r.id === editingRow.id ? { ...r, paid } : r))
    );
    setPayOpen(false);
    setEditingRow(null);
  };

  const applyDate = (dateStr) => {
    setSelectedDate(dateStr);
    setDateOpen(false);
  };

  return (
    <div className="bg-surface min-h-screen px-8 py-4">
      <h1 className="text-3xl font-semibold text-gray-900 mb-5 mt-1">
        Staff management
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Top bar */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          {/* Search (left) */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search employee"
              className="bg-white pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#EF4543]/40 focus:outline-none w-full"
            />
          </div>

          {/* Single-day selector (far right) */}
          <button
            onClick={() => setDateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FBE7E7] text-gray-700 text-sm rounded-lg border border-gray-200 hover:shadow-sm transition"
            title="Change date"
          >
            <Calendar size={16} className="text-gray-500" />
            {formatDateForBadge(selectedDate)}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-[#FBE7E7] text-gray-800 font-medium">
              <tr>
                <th className="text-left py-3 px-6">Employee ID</th>
                <th className="text-left py-3 px-6">Name</th>
                <th className="text-left py-3 px-6">Shift</th>
                <th className="text-left py-3 px-6">Salary</th>
                <th className="text-left py-3 px-6">Payment status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-gray-100 hover:bg-[#FBE7E7]/20 transition"
                >
                  <td className="py-3 px-6">{r.id}</td>
                  <td className="py-3 px-6">{r.name}</td>

                  {/* Shift cell (click → modal, allow multiple) */}
                  <td className="py-3 px-6">
                    <button
                        onClick={() => openShift(r)}
                        className="flex flex-wrap gap-2 min-w-[120px] text-left"
                        title="Edit shift(s)"
                    >
                        {r.shifts.length > 0 ? (
                        r.shifts.map((s, i) => (
                            <span
                            key={i}
                            className="text-xs rounded-full border px-2 py-1 bg-white"
                            >
                            {s}
                            </span>
                        ))
                        ) : (
                        <span className="text-gray-400 italic text-xs">
                            Select shift
                        </span>
                        )}
                    </button>
                    </td>


                  <td className="py-3 px-6">{r.salary}</td>

                  {/* Payment status (click → modal) */}
                  <td className="py-3 px-6">
                    <button
                      onClick={() => openPay(r)}
                      className="inline-flex items-center gap-2"
                      title="Set Paid/Unpaid"
                    >
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          r.paid ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span className={r.paid ? "text-green-600" : "text-red-600"}>
                        {r.paid ? "Paid" : "Unpaid"}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* You can drop in your pagination here if/when you need it */}
      </div>

      {/* Modals */}
      {shiftOpen && editingRow && (
        <ShiftModal
          open={shiftOpen}
          onClose={() => {
            setShiftOpen(false);
            setEditingRow(null);
          }}
          initial={editingRow.shifts}
          onApply={applyShifts}
        />
      )}

      {payOpen && editingRow && (
        <PaymentModal
          open={payOpen}
          onClose={() => {
            setPayOpen(false);
            setEditingRow(null);
          }}
          initial={editingRow.paid}
          onApply={applyPaid}
        />
      )}

      {dateOpen && (
        <SingleDateModal
          open={dateOpen}
          onClose={() => setDateOpen(false)}
          value={selectedDate}
          onApply={applyDate}
        />
      )}
    </div>
  );
}

/* --------------------------------- Modals --------------------------------- */

function ModalShell({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-[560px] max-w-[92vw]">
        {children}
      </div>
    </div>
  );
}

/** Multi-select “Shift” modal */
function ShiftModal({ open, onClose, initial = [], onApply }) {
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

/** Paid / Unpaid modal */
function PaymentModal({ open, onClose, initial = true, onApply }) {
  const [value, setValue] = useState(initial ? "Paid" : "Unpaid");

  if (!open) return null;
  return (
    <ModalShell>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">Select Status</h3>
        <div className="flex gap-3">
          {["Paid", "Unpaid"].map((opt) => (
            <button
              key={opt}
              onClick={() => setValue(opt)}
              className={`px-6 py-2 rounded-full border transition ${
                value === opt
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
            onClick={() => onApply(value === "Paid")}
            className="px-5 py-2 rounded-lg bg-[#EF4543] text-white hover:bg-[#e03b39]"
          >
            Apply Now
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/** Single-day date modal (simple, native date input) */
function SingleDateModal({ open, onClose, value, onApply }) {
  const [val, setVal] = useState(value);
  if (!open) return null;
  return (
    <ModalShell>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">Pick a date</h3>
        <input
          type="date"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
        <p className="text-xs text-gray-500 mt-2">
          *This screen allows selecting one date at a time.
        </p>
        <div className="border-t mt-6 pt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(val)}
            className="px-5 py-2 rounded-lg bg-[#EF4543] text-white hover:bg-[#e03b39]"
          >
            Apply Now
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* --------------------------------- Utils ---------------------------------- */

function formatDateForBadge(yyyy_mm_dd) {
  // "2025-11-20" -> "20/11/2025"
  const [y, m, d] = yyyy_mm_dd.split("-");
  return `${d}/${m}/${y}`;
}
