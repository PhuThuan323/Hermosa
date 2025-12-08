import React, { useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import DeleteSuccessModal from "../components/DeleteSuccessModal";

export default function CustomerManagement() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([
    { id: "CU001", name: "Trần Phú Thuận", orders: 12, phone: "945678792", total: "1.000.000 đ" },
    { id: "CU002", name: "Võ Thanh Nhàn", orders: 12, phone: "945678792", total: "2.000.000 đ" },
    { id: "CU003", name: "Như Trang", orders: 15, phone: "945678792", total: "4.300.000 đ" },
    { id: "CU004", name: "Hữu Phước", orders: 43, phone: "945678792", total: "4.040.000 đ" },
    { id: "CU005", name: "Lê Duẩn", orders: 22, phone: "945678792", total: "4.030.000 đ" },
    { id: "CU006", name: "Phạm Văn Đồng", orders: 22, phone: "945678792", total: "9.000.000 đ" },
    { id: "CU011", name: "Điện Biên Phủ", orders: 33, phone: "945678792", total: "1.000.000 đ" },
    { id: "CU101", name: "Steve Rogers", orders: 44, phone: "945678792", total: "2.000.000 đ" },
  ]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const askDelete = (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = () => {
    setRows((prev) => prev.filter((r) => r.id !== toDeleteId));
    setConfirmOpen(false);
    setDoneOpen(true);
  };

  return (
    <div className="bg-surface min-h-screen px-8 py-4">
        {/* Title */}
      <h1 className="text-3xl font-semibold text-gray-900 mb-5 mt-1">
          Customer management
        </h1>
      {/* Outer white container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Top bar: Search + Add button */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          {/* Search box */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customer"
              className="bg-white pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#EF4543]/40 focus:outline-none w-full"
            />
          </div>

          {/* Add Customer button */}
          <button
            onClick={() => navigate("/customers/add")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FBE7E7] hover:bg-[#f9dcdc] text-gray-800 text-sm font-medium rounded-lg transition"
          >
            <Plus size={16} className="text-[#EF4543]" />
            Add Customer
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-[#FBE7E7] text-gray-800 font-medium">
              <tr>
                <th className="text-left py-3 px-6">Customer ID</th>
                <th className="text-left py-3 px-6">Name</th>
                <th className="text-left py-3 px-6">No. Order</th>
                <th className="text-left py-3 px-6">Phone</th>
                <th className="text-left py-3 px-6">Total order</th>
                <th className="text-left py-3 px-6">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((cust, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-100 hover:bg-[#FBE7E7]/20 transition"
                >
                  <td className="py-3 px-6">{cust.id}</td>
                  <td className="py-3 px-6">{cust.name}</td>
                  <td className="py-3 px-6">{cust.orders}</td>
                  <td className="py-3 px-6">{cust.phone}</td>
                  <td className="py-3 px-6">{cust.total}</td>
                  <td className="py-3 px-6">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          console.log("Navigating to:", `/customers/edit/${cust.id}`);
                          navigate(`/customers/edit/${cust.id}`);
                        }}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-[#FBE7E7]/60 transition"
                      >
                        <Edit size={16} className="text-gray-700" />
                      </button>
                      <button
                        onClick={() => askDelete(cust.id)}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-[#FBE7E7]/60 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-[#EF4543]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
              
        {/* Pagination (optional, matches your design) */}
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
            {/* Modals */}
          <ConfirmDeleteModal
            open={confirmOpen}
            title="Delete Customer"
            message="Are you sure you want to delete this customer?"
            onCancel={() => setConfirmOpen(false)}
            onConfirm={doDelete}
          />
          <DeleteSuccessModal
            open={doneOpen}
            text="Delete Successful"
            onClose={() => setDoneOpen(false)}
      />
      </div>
    </div>
  );
} 