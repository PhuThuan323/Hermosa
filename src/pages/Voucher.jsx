import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Copy,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import VoucherModal from "../components/VoucherModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const API_BASE = "http://34.142.200.151/voucher";
const ITEMS_PER_PAGE = 10;

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [displayVouchers, setDisplayVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All"); // All, Active, Expired, Upcoming
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toDeleteCode, setToDeleteCode] = useState("");

  const fetchVouchers = async () => {
    try {
      setLoading(true);

      const [availableRes, expiredRes] = await Promise.all([
        axios.get(`${API_BASE}/available-admin`),
        axios.get(`${API_BASE}/expired`),
      ]);

      const available = availableRes.data.data || [];
      const expired = expiredRes.data.data || [];

      const allData = [...available, ...expired];
      const now = new Date();

      const formatted = allData.map((v) => ({
        code: v.voucherCode,
        description: v.description || "Không có mô tả",
        type:
          v.discountType === "percentage"
            ? `Giảm ${v.discountValue}%`
            : `Giảm ${new Intl.NumberFormat("vi-VN").format(v.discountValue)}đ`,
        minAmount: new Intl.NumberFormat("vi-VN").format(v.minPurchaseAmount || 0) + "đ",
        validFrom: format(new Date(v.validFrom), "dd/MM/yyyy"),
        validTo: format(new Date(v.validTo), "dd/MM/yyyy"),
        usageLimit: v.usageLimit === null || v.usageLimit === 0 ? "Không giới hạn" : v.usageLimit,
        used: v.totalOfUsage || 0,
        status:
          new Date(v.validTo) < now
            ? "Expired"
            : new Date(v.validFrom) > now
            ? "Upcoming"
            : "Active",
        rawData: v,
      }));

      // Sắp xếp theo ngày tạo mới nhất
      formatted.sort((a, b) => new Date(b.rawData.createdAt) - new Date(a.rawData.createdAt));

      setVouchers(formatted);
      setFilteredVouchers(formatted);
    } catch (err) {
      console.error("Lỗi tải voucher:", err);
      toast.error("Không tải được danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Lọc theo tab + tìm kiếm
  useEffect(() => {
    let result = [...vouchers];

    // Lọc theo tab
    if (activeTab === "Active") {
      result = result.filter((v) => v.status === "Active");
    } else if (activeTab === "Expired") {
      result = result.filter((v) => v.status === "Expired");
    } else if (activeTab === "Upcoming") {
      result = result.filter((v) => v.status === "Upcoming");
    }
    // "All" thì không lọc

    // Tìm kiếm
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.code.toLowerCase().includes(term) ||
          v.description.toLowerCase().includes(term)
      );
    }

    setFilteredVouchers(result);
    setCurrentPage(1);
  }, [activeTab, searchTerm, vouchers]);

  // Phân trang
  useEffect(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setDisplayVouchers(filteredVouchers.slice(start, end));
  }, [filteredVouchers, currentPage]);

  const totalPages = Math.ceil(filteredVouchers.length / ITEMS_PER_PAGE);

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/delete`, {
        data: { voucherCode: toDeleteCode },
      });
      toast.success("Xóa voucher thành công!");
      fetchVouchers();
    } catch (err) {
      toast.error("Xóa thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setConfirmDelete(false);
      setToDeleteCode("");
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã copy: ${code}`);
  };

  // Đếm số lượng cho từng tab
  const countAll = vouchers.length;
  const countActive = vouchers.filter((v) => v.status === "Active").length;
  const countExpired = vouchers.filter((v) => v.status === "Expired").length;
  const countUpcoming = vouchers.filter((v) => v.status === "Upcoming").length;

  const tabs = [
    { key: "All", label: `Tất cả (${countAll})` },
    { key: "Active", label: `Đang hoạt động (${countActive})` },
    { key: "Expired", label: `Hết hạn (${countExpired})` },
    { key: "Upcoming", label: `Sắp tới (${countUpcoming})` },
  ];

  return (
    <div className="bg-surface min-h-screen px-8 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Voucher</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="bg-pink-50 rounded-xl px-4 py-2 flex gap-3 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-pink-600 shadow-md"
                    : "text-gray-700 hover:bg-white/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm mã hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-80 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none text-sm"
              />
            </div>

            <button
              onClick={() => {
                setEditingVoucher(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-600 transition shadow-lg"
            >
              <Plus size={20} /> Tạo Voucher
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-16 h-16 animate-spin text-pink-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-pink-50 text-pink-800 font-bold">
                  <tr>
                    <th className="text-left py-4 px-6">Mã Voucher</th>
                    <th className="text-left py-4 px-6">Mô tả</th>
                    <th className="text-left py-4 px-6">Giảm giá</th>
                    <th className="text-left py-4 px-6">Đơn tối thiểu</th>
                    <th className="text-left py-4 px-6">Hiệu lực</th>
                    <th className="text-left py-4 px-6">Đã dùng</th>
                    <th className="text-left py-4 px-6">Trạng thái</th>
                    <th className="text-left py-4 px-6">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {displayVouchers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-20 text-gray-500 text-lg font-medium">
                        {searchTerm || activeTab !== "All"
                          ? "Không tìm thấy voucher nào"
                          : "Chưa có voucher nào"}
                      </td>
                    </tr>
                  ) : (
                    displayVouchers.map((v) => (
                      <tr key={v.code} className="border-t hover:bg-pink-50/30 transition">
                        <td className="py-4 px-6 font-bold text-pink-700 flex items-center gap-2">
                          {v.code}
                          <button onClick={() => copyCode(v.code)} className="text-gray-500 hover:text-pink-600 transition">
                            <Copy size={16} />
                          </button>
                        </td>
                        <td className="py-4 px-6 max-w-xs truncate" title={v.description}>
                          {v.description}
                        </td>
                        <td className="py-4 px-6 font-semibold text-rose-600">{v.type}</td>
                        <td className="py-4 px-6">{v.minAmount}</td>
                        <td className="py-4 px-6 text-sm">
                          {v.validFrom} → {v.validTo}
                        </td>
                        <td className="py-4 px-6 text-center font-bold">
                          {v.used} / {v.usageLimit}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-4 py-2 rounded-full text-xs font-bold ${
                              v.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : v.status === "Expired"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {v.status === "Active" ? "Đang hoạt động" : v.status === "Expired" ? "Hết hạn" : "Sắp tới"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setEditingVoucher(v);
                                setIsModalOpen(true);
                              }}
                              className="p-2.5 rounded-lg border border-gray-300 hover:bg-blue-50 transition"
                              title="Sửa"
                            >
                              <Edit size={18} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => {
                                setToDeleteCode(v.code);
                                setConfirmDelete(true);
                              }}
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

            {/* PHÂN TRANG */}
            <div className="mt-8 flex flex-col items-center gap-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-300 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <ChevronLeft size={20} /> Trước
                </button>

                <div className="flex gap-2">
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
                            ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white scale-110"
                            : "bg-white border border-gray-300 hover:bg-pink-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 3 && (
                    <>
                      <span className="px-3 text-gray-500">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-12 h-12 rounded-xl font-bold bg-white border border-gray-300 hover:bg-pink-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 rounded-xl font-bold bg-white border border-gray-300 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  Sau <ChevronRight size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-600">
                Trang <span className="text-pink-600 font-bold text-lg">{currentPage}</span> / {totalPages || 1} • Tổng{" "}
                <strong>{filteredVouchers.length}</strong> voucher
              </p>
            </div>
          </>
        )}
      </div>

      {/* MODAL TẠO / SỬA */}
      <VoucherModal
        isOpen={isModalOpen || !!editingVoucher}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVoucher(null);
        }}
        onSubmit={fetchVouchers}
        initialData={editingVoucher?.rawData || null}
        isEdit={!!editingVoucher}
      />

      {/* XÁC NHẬN XÓA */}
      <ConfirmDeleteModal
        open={confirmDelete}
        title="Xóa Voucher"
        message={`Xóa vĩnh viễn voucher ${toDeleteCode}? Không thể khôi phục!`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}