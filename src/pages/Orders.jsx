import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-hot-toast";
import SelectOrderStatusModal from "../components/SelectOrderStatusModal";
import SelectDateModal from "../components/SelectDateModal";

const API_BASE = "http://34.124.251.251";
const ITEMS_PER_PAGE = 10;

export default function OrderManagement() {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchOrders = async (retryCount = 0) => {
    const possibleEndpoints = [
      `${API_BASE}/order/view-all`,
      `${API_BASE}/view-all`,
      `${API_BASE}/order/list`,
      `${API_BASE}/orders`,
    ];

    try {
      setLoading(true);
      let success = false;
      let data = null;

      for (const url of possibleEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          const res = await axios.get(url, {
            signal: controller.signal,
            timeout: 15000,
          });

          clearTimeout(timeoutId);

          if (res.data && (res.data.status === "Success" || Array.isArray(res.data.data) || Array.isArray(res.data))) {
            data = Array.isArray(res.data.data)
              ? res.data.data
              : Array.isArray(res.data)
              ? res.data
              : res.data.orders || [];

            console.log(`Tìm thấy dữ liệu ở: ${url}`);
            success = true;
            break;
          }
        } catch (e) {
          console.log(`Thất bại với ${url}:`, e.message);
        }
      }

      if (!success || !data || data.length === 0) {
        throw new Error("Không tìm thấy dữ liệu đơn hàng");
      }

      const formatted = data.map((o) => ({
        id: o.orderID || o._id,
        total: new Intl.NumberFormat("vi-VN").format(o.finalTotal || o.totalInvoice || 0) + " đ",
        customer: o.userName || o.userID || "Khách lẻ",
        date: format(new Date(o.createAt || o.createdAt || Date.now()), "dd-MM-yyyy"),
        time: format(new Date(o.createAt || o.createdAt || Date.now()), "HH:mm"),
        rawPaymentStatus: o.paymentStatus || "not_done",
        rawStatus: o.status || "pending",
        paymentMethod: o.paymentMethod || "COD",
        rawDate: new Date(o.createAt || o.createdAt || Date.now()),
      }));

      const sortedByLatest = formatted.sort((a, b) => b.rawDate - a.rawDate);
      setAllOrders(sortedByLatest);
      setFilteredOrders(sortedByLatest);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err.message);
      if (retryCount < 2) {
        toast.loading(`Đang thử lại... (${retryCount + 1}/3)`, { id: "retry" });
        setTimeout(() => fetchOrders(retryCount + 1), 3000);
      } else {
        toast.error("Không thể kết nối đến server đơn hàng. Vui lòng kiểm tra backend!");
      }
    } finally {
      setLoading(false);
      toast.dismiss("retry");
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 120000); // Refresh mỗi 2 phút
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = allOrders;

    if (activeTab === "Chờ xác nhận") result = result.filter((o) => o.rawStatus === "pending");
    else if (activeTab === "Hoàn thành") result = result.filter((o) => o.rawStatus === "done");
    else if (activeTab === "Đã hủy") result = result.filter((o) => o.rawStatus === "canceled");

    if (searchTerm) {
      result = result.filter((o) => o.id.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [activeTab, searchTerm, allOrders]);

  useEffect(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setDisplayOrders(filteredOrders.slice(start, end));
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  // Dùng chung 1 hàm đổi trạng thái – backend sẽ tự xử lý paymentStatus khi status = done
  const handleChangeStatus = async (newStatus) => {
    if (!selectedOrderId || !newStatus) return;

    try {
      const res = await axios.put(
        `${API_BASE}/order/change-order-status`,
        {},
        {
          params: { orderID: selectedOrderId, status: newStatus },
          timeout: 10000,
        }
      );

      if (res.data.status === "Success") {
        toast.success(
          newStatus === "done"
            ? "Đã xác nhận hoàn thành đơn & thu tiền thành công!"
            : "Đã hủy đơn hàng thành công!"
        );
        fetchOrders();
      } else {
        toast.error(res.data.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Lỗi đổi trạng thái:", err);
      toast.error("Lỗi kết nối server");
    } finally {
      setIsStatusOpen(false);
      setSelectedOrderId(null);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    setLoadingDetail(true);
    try {
      const res = await axios.get(`${API_BASE}/order/view`, {
        params: { orderID: orderId },
        timeout: 10000,
      });

      if (res.data.status === "Success") {
        setSelectedOrderDetail(res.data.data);
        setIsDetailOpen(true);
      } else {
        toast.error("Không tìm thấy chi tiết đơn hàng");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải chi tiết đơn hàng");
    } finally {
      setLoadingDetail(false);
    }
  };

  const countPending = allOrders.filter((o) => o.rawStatus === "pending").length;
  const countDone = allOrders.filter((o) => o.rawStatus === "done").length;
  const countCanceled = allOrders.filter((o) => o.rawStatus === "canceled").length;

  const tabs = [
    `Tất cả (${allOrders.length})`,
    `Chờ xác nhận (${countPending})`,
    `Hoàn thành (${countDone})`,
    `Đã hủy (${countCanceled})`,
  ];

  return (
    <div className="bg-surface min-h-screen px-8 py-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Quản lý đơn hàng</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="bg-pink-50 rounded-xl px-4 py-2 flex gap-3 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.split(" (")[0])}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab.split(" (")[0]
                    ? "bg-white text-pink-600 shadow-md"
                    : "text-gray-700 hover:bg-white/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-pink-50 text-gray-700 text-sm font-medium rounded-xl hover:shadow-sm transition"
            >
              <CalendarIcon size={18} />
              All Time
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-64 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none text-sm"
              />
            </div>
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
                    <th className="text-left py-4 px-6">Order ID</th>
                    <th className="text-left py-4 px-6">Tổng tiền</th>
                    <th className="text-left py-4 px-6">Khách hàng</th>
                    <th className="text-left py-4 px-6">Ngày & Giờ</th>
                    <th className="text-left py-4 px-6">Thanh toán</th>
                    <th className="text-left py-4 px-6">Trạng thái & Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {displayOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-16 text-gray-500 text-lg">
                        Không có đơn hàng nào
                      </td>
                    </tr>
                  ) : (
                    displayOrders.map((order) => (
                      <tr key={order.id} className="border-t hover:bg-pink-50/30 transition">
                        <td className="py-4 px-6">
                          <button
                            onClick={() => fetchOrderDetail(order.id)}
                            className="font-bold text-pink-700 hover:text-pink-500 underline transition"
                          >
                            #{order.id}
                          </button>
                        </td>
                        <td className="py-4 px-6 font-bold text-pink-600">{order.total}</td>
                        <td className="py-4 px-6">{order.customer}</td>
                        <td className="py-4 px-6 text-gray-600">
                          {order.date} <br />
                          <span className="text-xs">{order.time}</span>
                        </td>

                        {/* Thanh toán */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-5 py-2 rounded-full text-white font-bold text-xs shadow-sm ${
                              order.rawPaymentStatus === "done" ? "bg-blue-500" : "bg-yellow-500"
                            }`}
                          >
                            {order.rawPaymentStatus === "done" ? "Chuyển khoản" : "Tiền mặt"}
                          </span>
                        </td>

                        {/* Trạng thái + Nút hành động */}
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-4 py-1.5 rounded-full text-white font-bold text-xs ${
                                order.rawStatus === "done"
                                  ? "bg-green-500"
                                  : order.rawStatus === "canceled"
                                  ? "bg-red-600"
                                  : "bg-yellow-500"
                              }`}
                            >
                              {order.rawStatus === "done"
                                ? "Hoàn thành"
                                : order.rawStatus === "canceled"
                                ? "Đã hủy"
                                : "Chờ xác nhận"}
                            </span>

                            {/* Chỉ hiện nút khi đang chờ xác nhận */}
                            {order.rawStatus === "pending" && (
                              <button
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setIsStatusOpen(true);
                                }}
                                className="ml-4 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full hover:from-pink-600 hover:to-rose-600 transition shadow-sm"
                              >
                                Thay đổi trạng thái
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="mt-8 flex flex-col items-center gap-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-300 hover:bg-pink-50 hover:border-pink-300 text-gray-700"
                >
                  <ChevronLeft size={20} /> Trước
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (totalPages > 5 && currentPage > totalPages - 3) {
                      pageNum = totalPages - 4 + i;
                    }
                    if (pageNum < 1 || pageNum > totalPages) return null;

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

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 text-gray-400 font-bold">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-12 h-12 rounded-xl font-bold text-pink-600 hover:bg-pink-100 transition"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-300 hover:bg-pink-50 hover:border-pink-300 text-gray-700"
                >
                  Sau <ChevronRight size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-600 font-medium">
                Đang xem trang <span className="text-pink-600 font-bold text-lg">{currentPage}</span> / {totalPages || 1}{" "}
                • Tổng <strong className="text-pink-600">{filteredOrders.length}</strong> đơn hàng
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modal chọn trạng thái */}
      <SelectOrderStatusModal
        open={isStatusOpen}
        onClose={() => {
          setIsStatusOpen(false);
          setSelectedOrderId(null);
        }}
        onApply={handleChangeStatus}
      />

      <SelectDateModal
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onApply={() => {}}
      />

      {/* Modal Chi Tiết Đơn Hàng */}
      {isDetailOpen && selectedOrderDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết đơn hàng <span className="text-pink-600">#{selectedOrderDetail.orderID}</span>
              </h2>
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedOrderDetail(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light"
              >
                ×
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Thông tin cơ bản - Chia 2 phần rõ ràng để tránh đè chữ */}
              <div className="space-y-6">
                {/* Dòng 1: Chỉ hiển thị Khách hàng (chiếm toàn bộ chiều rộng nếu tên dài) */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Khách hàng</p>
                  <p className="font-bold text-xl break-words">
                    {selectedOrderDetail.userName || selectedOrderDetail.userID || "Khách lẻ"}
                  </p>
                </div>

                {/* Dòng 2: Grid 3 cột cho các thông tin ngắn */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                    <p className="font-bold text-lg">
                      {format(new Date(selectedOrderDetail.createAt || selectedOrderDetail.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái đơn</p>
                    <span className={`inline-block px-4 py-2 rounded-full text-white font-bold text-sm mt-1 ${
                      selectedOrderDetail.status === "done" ? "bg-green-500" :
                      selectedOrderDetail.status === "canceled" ? "bg-red-600" : "bg-yellow-500"
                    }`}>
                      {selectedOrderDetail.status === "done" ? "Hoàn thành" :
                      selectedOrderDetail.status === "canceled" ? "Đã hủy" : "Chờ xác nhận"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                    <span className={`inline-block px-4 py-2 rounded-full text-white font-bold text-sm mt-1 ${
                      selectedOrderDetail.paymentStatus === "done" ? "bg-blue-500" : "bg-yellow-500"
                    }`}>
                      {selectedOrderDetail.paymentStatus === "done" ? "Chuyển khoản" : "Tiền mặt (COD)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <h3 className="text-xl font-bold mb-6">Danh sách sản phẩm</h3>
                <div className="space-y-4">
                  {selectedOrderDetail.products && selectedOrderDetail.products.length > 0 ? (
                    selectedOrderDetail.products.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-5 border-b last:border-0">
                        <div className="flex items-center gap-5 flex-1">                       

                          <div className="flex-1 min-w-0">
                            {/* Tên sản phẩm - lấy từ productName nếu có, nếu không thì fallback */}
                            <p className="font-semibold text-lg truncate">
                              {item.productName || item.name || `Sản phẩm ID: ${item.productID}`}
                            </p>
                            <div className="text-sm text-gray-600 mt-1">
                              <span>Số lượng: <strong>{item.quantity}</strong></span>                             
                            </div>
                          </div>
                        </div>                
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">Không có sản phẩm trong đơn hàng</p>
                  )}
                </div>
              </div>

              {/* Tính tiền */}
              <div className="bg-pink-50 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Tạm tính</span>
                  <span className="font-bold">{new Intl.NumberFormat("vi-VN").format(selectedOrderDetail.totalInvoice || 0)} đ</span>
                </div>

                {selectedOrderDetail.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá {selectedOrderDetail.voucherCodeApply ? `(Mã: ${selectedOrderDetail.voucherCodeApply})` : ""}</span>
                    <span className="font-bold">-{new Intl.NumberFormat("vi-VN").format(selectedOrderDetail.discountAmount)} đ</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Phí giao hàng</span>
                  <span>{new Intl.NumberFormat("vi-VN").format(selectedOrderDetail.deliveryFee || 0)} đ</span>
                </div>

                <div className="flex justify-between">
                  <span>Tip tài xế</span>
                  <span>{new Intl.NumberFormat("vi-VN").format(selectedOrderDetail.tipsforDriver || 0)} đ</span>
                </div>

                <div className="border-t-2 border-pink-200 pt-4 flex justify-between text-xl">
                  <span className="font-bold">Tổng thanh toán</span>
                  <span className="font-bold text-3xl text-pink-600">
                    {new Intl.NumberFormat("vi-VN").format(selectedOrderDetail.finalTotal || 0)} đ
                  </span>
                </div>
              </div>

              {/* Nút đóng */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setIsDetailOpen(false);
                    setSelectedOrderDetail(null);
                  }}
                  className="px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-600 transition shadow-lg text-lg"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
