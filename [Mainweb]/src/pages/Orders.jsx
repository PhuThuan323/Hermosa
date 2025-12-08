import React, { useState } from "react";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import SelectPaymentModal from "../components/SelectPaymentModal";
import SelectOrderStatusModal from "../components/SelectOrderStatusModal";
import SelectDateModal from "../components/SelectDateModal";

export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState("All order (240)");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // which row is being edited
  const [selectedRowIdx, setSelectedRowIdx] = useState(null);

  const tabs = ["All order (240)", "Completed", "Pending", "Canceled"];

  // keep orders in state so we can update them
  const [orders, setOrders] = useState([
    { id: "#ORD0001", total: "85.000 đ",  customer: "Trần Phú Thuận",  date: "12-01-2025", payment: "Paid",   status: "Delivered" },
    { id: "#ORD0002", total: "400.000 đ", customer: "Nguyễn Ngọc Linh", date: "03-01-2025", payment: "Unpaid", status: "Pending"   },
    { id: "#ORD0003", total: "4.400.000 đ", customer: "Hữu Phước",      date: "01-04-2025", payment: "Paid",   status: "Delivered" },
    { id: "#ORD0004", total: "450.000 đ", customer: "Võ Thanh Nhàn",    date: "04-01-2025", payment: "Paid",   status: "Shipped"   },
  ]);

  // openers
  const openPaymentForRow = (idx) => {
    setSelectedRowIdx(idx);
    setIsPaymentOpen(true);
  };
  const openStatusForRow = (idx) => {
    setSelectedRowIdx(idx);
    setIsStatusOpen(true);
  };

  // apply handlers
  const applyPayment = (newPayment) => {
    if (selectedRowIdx == null) return;
    setOrders((prev) =>
      prev.map((o, i) => (i === selectedRowIdx ? { ...o, payment: newPayment } : o))
    );
    setIsPaymentOpen(false);
    setSelectedRowIdx(null);
  };

  const applyStatus = (newStatus) => {
    if (selectedRowIdx == null) return;
    setOrders((prev) =>
      prev.map((o, i) => (i === selectedRowIdx ? { ...o, status: newStatus } : o))
    );
    setIsStatusOpen(false);
    setSelectedRowIdx(null);
  };

  return (
    <div className="bg-surface min-h-screen px-8 py-4">
      <h1 className="text-3xl font-semibold text-gray-900 mb-4 mt-1">
        Order management
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* top bar */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          {/* pink tabs */}
          <div className="bg-[#FBE7E7] rounded-xl px-4 py-2 flex gap-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${
                  activeTab === tab
                    ? "bg-white text-[#EF4543] shadow-sm"
                    : "text-gray-700 hover:bg-white/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* date + search (not inside the pink box) */}
          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FBE7E7] text-gray-700 text-sm rounded-lg border border-gray-200 hover:shadow-sm transition"
            >
              <CalendarIcon size={16} className="text-gray-500" />
              All Time
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search order report"
                className="bg-white pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#EF4543]/40 focus:outline-none w-56"
              />
            </div>
          </div>
        </div>

        {/* table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-[#FBE7E7] text-gray-800 font-medium">
              <tr>
                <th className="text-left py-3 px-6">Order Id</th>
                <th className="text-left py-3 px-6">Total</th>
                <th className="text-left py-3 px-6">Customer</th>
                <th className="text-left py-3 px-6">Date</th>
                <th className="text-left py-3 px-6">Payment</th>
                <th className="text-left py-3 px-6">Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, i) => (
                <tr
                  key={order.id}
                  className="border-t border-gray-100 hover:bg-[#FBE7E7]/20 transition"
                >
                  <td className="py-3 px-6">{order.id}</td>
                  <td className="py-3 px-6">{order.total}</td>
                  <td className="py-3 px-6">{order.customer}</td>
                  <td className="py-3 px-6">{order.date}</td>

                  {/* CLICKABLE payment cell */}
                  <td
                    className="py-3 px-6 cursor-pointer select-none"
                    onClick={() => openPaymentForRow(i)}
                    title="Change payment"
                  >
                    <span
                      className={
                        order.payment === "Paid" ? "text-green-600" : "text-red-500"
                      }
                    >
                      {order.payment}
                    </span>
                  </td>

                  {/* CLICKABLE status cell */}
                  <td
                    className="py-3 px-6 cursor-pointer select-none"
                    onClick={() => openStatusForRow(i)}
                    title="Change status"
                  >
                    {order.status === "Delivered" && (
                      <span className="text-green-600 font-medium">Delivered</span>
                    )}
                    {order.status === "Pending" && (
                      <span className="text-yellow-600 font-medium">Pending</span>
                    )}
                    {order.status === "Shipped" && (
                      <span className="text-gray-600 font-medium">Shipped</span>
                    )}
                    {order.status === "Canceled" && (
                      <span className="text-red-600 font-medium">Canceled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex justify-between items-center mt-6">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-[#FBE7E7]/60 transition">
            ← Previous
          </button>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                className={`w-8 h-8 rounded-md text-sm font-medium ${
                  num === 1
                    ? "bg-[#FBE7E7] text-[#EF4543]"
                    : "border border-gray-200 hover:bg-[#FBE7E7]/40"
                }`}
              >
                {num}
              </button>
            ))}
            <span className="px-1 text-gray-400">.....</span>
            <button className="w-8 h-8 rounded-md border border-gray-200 hover:bg-[#FBE7E7]/40">
              24
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-[#FBE7E7]/60 transition">
            Next →
          </button>
        </div>

        {/* MODALS */}
        <SelectPaymentModal
          open={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onApply={applyPayment}
        />

        <SelectOrderStatusModal
          open={isStatusOpen}
          onClose={() => setIsStatusOpen(false)}
          onApply={applyStatus}
        />

        <SelectDateModal
          open={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          onApply={(dates) => console.log("Dates:", dates)}
        />
      </div>
    </div>
  );
}
