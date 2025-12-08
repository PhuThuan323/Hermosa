// src/pages/CustomerManagement.jsx
import React, { useState, useEffect } from "react";
import { Search, Loader2, UserPlus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import DeleteSuccessModal from "../components/DeleteSuccessModal";

const API_BASE = "http://34.151.64.207/user";
const ITEMS_PER_PAGE = 10;

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [allCustomers, setAllCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [displayCustomers, setDisplayCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/view-all-user`);

      if (res.data.status === "Success") {
        const formatted = res.data.data.map((user) => ({
          id: user.userID || user._id.toString().slice(-6),
          name: user.name || "Chưa đặt tên",
          email: user.email || "Không có email",
          phone: user.phone || "Chưa cập nhật",
          orders: user.totalOrders || 0,
          totalSpent: user.totalSpent || 0,
          signupMethod: user.signupMethod || "Username",
          joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "Không rõ",
          rawUser: user,
        }));

        setAllCustomers(formatted);
        setFilteredCustomers(formatted);
      }
    } catch (err) {
      toast.error("Lỗi tải danh sách khách hàng");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Lọc theo tên hoặc email
  useEffect(() => {
    const result = allCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(result);
    setCurrentPage(1);
  }, [searchTerm, allCustomers]);

  // Phân trang
  useEffect(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setDisplayCustomers(filteredCustomers.slice(start, end));
  }, [filteredCustomers, currentPage]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);

  const askDelete = (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    try {
      setAllCustomers((prev) => prev.filter((c) => c.id !== toDeleteId));
      setFilteredCustomers((prev) => prev.filter((c) => c.id !== toDeleteId));
      toast.success("Xóa khách hàng thành công!");
    } catch (err) {
      toast.error("Xóa thất bại");
    } finally {
      setConfirmOpen(false);
      setDoneOpen(true);
    }
  };

  return (
    <div className="bg-surface min-h-screen px-8 py-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Management</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Top bar */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm khách hàng theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none text-sm"
            />
          </div>

          <button
            onClick={() => navigate("/customers/add")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-600 transition shadow-lg"
          >
            <UserPlus size={20} />
            Thêm khách hàng
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-16 h-16 animate-spin text-pink-500" />
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-pink-50 text-pink-800 font-bold">
                  <tr>
                    <th className="text-left py-4 px-6">ID</th>
                    <th className="text-left py-4 px-6">Tên khách hàng</th>
                    <th className="text-left py-4 px-6">Email</th>
                    <th className="text-left py-4 px-6">Phương thức đăng ký</th>
                    <th className="text-left py-4 px-6">Ngày tham gia</th>
                    <th className="text-left py-4 px-6">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {displayCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-16 text-gray-500 text-lg">
                        Không tìm thấy khách hàng nào
                      </td>
                    </tr>
                  ) : (
                    displayCustomers.map((cust) => (
                      <tr key={cust.id} className="border-t hover:bg-pink-50/30 transition">
                        <td className="py-4 px-6 font-bold text-pink-700">#{cust.id}</td>
                        <td className="py-4 px-6 font-bold">{cust.name}</td>
                        <td className="py-4 px-6 text-gray-600">{cust.email}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                              cust.signupMethod === "Google"
                                ? "bg-blue-100 text-blue-700"
                                : cust.signupMethod === "Facebook"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {cust.signupMethod}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{cust.joinDate}</td>
                        <td className="py-4 px-6">
                          <div className="flex gap-3">
                            <button
                              onClick={() => navigate(`/customers/edit/${cust.id}`)}
                              className="p-2.5 rounded-lg border border-gray-300 hover:bg-blue-50 transition"
                              title="Chỉnh sửa"
                            >
                              <Edit size={18} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => askDelete(cust.id)}
                              className="p-2.5 rounded-lg border border-red-200 hover:bg-red-50 transition"
                              title="Xóa"
                            >
                              <Trash2 size={18} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PHÂN TRANG ĐẸP NHƯ ORDERS */}
            <div className="mt-8 flex flex-col items-center gap-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2
                    disabled:opacity-40 disabled:cursor-not-allowed
                    bg-white border border-gray-300 hover:bg-pink-50 hover:border-pink-300 text-gray-700"
                >
                  <ChevronLeft size={20} /> Trước
                </button>

                <div className="flex items-center gap-2">
                  {currentPage > 4 && (
                    <>
                      <button onClick={() => setCurrentPage(1)} className="w-12 h-12 rounded-xl font-bold text-pink-600 hover:bg-pink-100 transition">1</button>
                      {currentPage > 5 && <span className="px-2 text-gray-400 font-bold">...</span>}
                    </>
                  )}

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-12 h-12 rounded-xl font-bold transition-all shadow-sm ${
                          currentPage === pageNum
                            ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white scale-110 shadow-lg"
                            : "bg-white border border-gray-300 hover:bg-pink-50 hover:border-pink-300 text-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {currentPage < totalPages - 3 && totalPages > 5 && (
                    <>
                      <span className="px-2 text-gray-400 font-bold">...</span>
                      <button onClick={() => setCurrentPage(totalPages)} className="w-12 h-12 rounded-xl font-bold text-pink-600 hover:bg-pink-100 transition">
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2
                    disabled:opacity-40 disabled:cursor-not-allowed
                    bg-white border border-gray-300 hover:bg-pink-50 hover:border-pink-300 text-gray-700"
                >
                  Sau <ChevronRight size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-600 font-medium">
                Đang xem trang <span className="text-pink-600 font-bold text-lg">{currentPage}</span> / {totalPages || 1}
                &nbsp;• Tổng <strong className="text-pink-600">{allCustomers.length}</strong> khách hàng
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <ConfirmDeleteModal
        open={confirmOpen}
        title="Xóa khách hàng"
        message="Bạn có chắc chắn muốn xóa khách hàng này không? Hành động này không thể hoàn tác."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />
      <DeleteSuccessModal
        open={doneOpen}
        text="Xóa khách hàng thành công!"
        onClose={() => setDoneOpen(false)}
      />
    </div>
  );
}