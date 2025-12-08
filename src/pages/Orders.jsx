import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-hot-toast";
import SelectPaymentModal from "../components/SelectPaymentModal";
import SelectOrderStatusModal from "../components/SelectOrderStatusModal";
import SelectDateModal from "../components/SelectDateModal";

const API_BASE = "http://34.151.64.207";
const ITEMS_PER_PAGE = 10;

export default function OrderManagement() {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [displayOrders, setDisplayOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All order");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = async (retryCount = 0) => {
  const possibleEndpoints = [
    `${API_BASE}/view-all`,           
    `${API_BASE}/order/view-all`,     
    `${API_BASE}/orders`,             
    `${API_BASE}/order/list`,        
    `${API_BASE}/list`,               
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
          timeout: 15000
        });

        clearTimeout(timeoutId);

        if (res.data && (res.data.status === "Success" || Array.isArray(res.data.data) || Array.isArray(res.data))) {
          data = Array.isArray(res.data.data) ? res.data.data : 
                 Array.isArray(res.data) ? res.data : 
                 res.data.orders || [];

          console.log(`Tìm thấy dữ liệu ở: ${url}`);
          success = true;
          break;
        }
      } catch (e) {
        console.log(`Thất bại với ${url}:`, e.message);
        continue;
      }
    }

    if (!success || data.length === 0) {
      throw new Error("Không tìm thấy endpoint nào hợp lệ");
    }

    const formatted = data.map((o) => ({
      id: o.orderID || o._id,
      total: new Intl.NumberFormat("vi-VN").format(o.totalInvoice || o.finalTotal || 0) + " đ",
      customer: o.userName || o.userID || "Khách lẻ",
      date: format(new Date(o.createAt || o.createdAt || Date.now()), "dd-MM-yyyy"),
      time: format(new Date(o.createAt || o.createdAt || Date.now()), "HH:mm"),
      payment: o.paymentStatus === "done" ? "Paid" : "Unpaid",
      status: 
        o.status === "pending" ? "Pending" :
        o.status === "confirmed" ? "Confirmed" :
        o.status === "preparing" ? "Preparing" :
        o.status === "delivering" ? "Delivering" :
        o.status === "done" ? "Delivered" :
        o.status === "canceled" ? "Canceled" : "Pending",
      rawStatus: o.status || "pending",
      paymentMethod: o.paymentMethod || "COD",
      rawDate: new Date(o.createAt || o.createdAt || Date.now()),
    }));

    const sortedByLatest = formatted.sort((a, b) => b.rawDate - a.rawDate);
    setAllOrders(sortedByLatest);
    setFilteredOrders(sortedByLatest);

  } catch (err) {
    console.error("Lỗi tải đơn hàng lần", retryCount + 1, err.message);

    if (retryCount < 2) {
      toast.loading(`Đang tìm server... (${retryCount + 1}/3)`, { id: "finding" });
      setTimeout(() => fetchOrders(retryCount + 1), 3000);
    } else {
      toast.error("Không tìm thấy server đơn hàng! Liên hệ admin kiểm tra backend", {
        duration: 8000,
      });
    }
  } finally {
    setLoading(false);
    toast.dismiss("finding");
  }
};

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
    fetchOrders();
  }, 120000); 

  return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = allOrders;

    if (activeTab.includes("Chờ xác nhận")) result = result.filter(o => o.rawStatus === "pending");
    else if (activeTab.includes("Đã xác nhận")) result = result.filter(o => o.rawStatus === "confirmed");
    else if (activeTab.includes("Đang chuẩn bị")) result = result.filter(o => o.rawStatus === "preparing");
    else if (activeTab.includes("Đang giao")) result = result.filter(o => o.rawStatus === "delivering");
    else if (activeTab.includes("Hoàn thành")) result = result.filter(o => o.rawStatus === "done");
    else if (activeTab.includes("Đã hủy")) result = result.filter(o => o.rawStatus === "canceled");

    if (searchTerm) {
      result = result.filter(o => o.id.toString().includes(searchTerm));
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

  const handleChangeStatus = async (newStatus) => {
    try {
      const cleanOrderId = selectedOrderId?.trim();
      if (!cleanOrderId) return toast.error("Không có Order ID!");

      const allowed = ["pending", "confirm", "deliver", "done"];
      if (!allowed.includes(newStatus)) return toast.error("Trạng thái không hợp lệ!");

      const possiblePaths = [
        "/change-order-status",
        "/order/change-order-status",
        "/api/change-order-status",
        "/orders/change-order-status",
        "/admin/change-order-status"
      ];

      let success = false;

      for (const path of possiblePaths) {
        try {
          console.log(`Đang thử: ${API_BASE}${path}`);

          const res = await axios.put(`${API_BASE}${path}`, null, {
            params: { orderID: cleanOrderId, status: newStatus },
            timeout: 8000
          });

          if (res.data.status === "Success") {
            toast.success(`Cập nhật thành công! (dùng ${path})`);
            fetchOrders();
            success = true;
            break;
          }
        } catch (e) {
          console.log(`${path} thất bại`);
          continue;
        }
      }

      if (!success) {
        throw new Error("Không tìm thấy API đổi trạng thái");
      }

    } catch (err) {
      console.error("Lỗi cuối cùng:", err.message);
      toast.error("Cập nhật thất bại – không tìm thấy API đúng");
    } finally {
      setIsStatusOpen(false);
    }
  };

  const handleMarkAsPaid = async (orderId) => {
    try {
      const res = await axios.put(`${API_BASE}/mark-as-paid`, null, {
        params: { orderID: orderId }
      });

      if (res.data.status === "Success") {
        toast.success("Đã đánh dấu thanh toán thành công!");
        fetchOrders(); 
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi đánh dấu thanh toán");
    }
  };

  const tabs = [
    `Tất cả (${allOrders.length})`,
    `Chờ xác nhận (${allOrders.filter(o => o.rawStatus === "pending").length})`,
    `Đang chuẩn bị (${allOrders.filter(o => o.rawStatus === "preparing").length})`,
    `Hoàn thành (${allOrders.filter(o => o.rawStatus === "done").length})`,
    `Đã hủy (${allOrders.filter(o => o.rawStatus === "canceled").length})`,
  ];

  return (
    <div className="bg-surface min-h-screen px-8 py-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Management</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="bg-pink-50 rounded-xl px-4 py-2 flex gap-3 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab
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
                    <th className="text-left py-4 px-6">Total</th>
                    <th className="text-left py-4 px-6">Customer</th>
                    <th className="text-left py-4 px-6">Date & Time</th>
                    <th className="text-left py-4 px-6">Payment</th>
                    <th className="text-left py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayOrders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-pink-50/30 transition">
                      <td className="py-4 px-6 font-bold text-pink-700">#{order.id}</td>
                      <td className="py-4 px-6 font-bold text-pink-600">{order.total}</td>
                      <td className="py-4 px-6">{order.customer}</td>
                      <td className="py-4 px-6 text-gray-600">
                        {order.date} <br />
                        <span className="text-xs">{order.time}</span>
                      </td>
                      <td
                        className="py-4 px-6 cursor-pointer select-none"
                        onClick={() => {
                          if (order.payment === "Unpaid") {
                            handleMarkAsPaid(order.id);
                          }
                        }}
                      >
                        <span className={`inline-flex items-center px-5 py-2.5 rounded-full text-white font-bold text-xs shadow-lg transition-all duration-300 ${
                          order.payment === "Paid"
                            ? "bg-green-500 scale-105"
                            : "bg-red-500 hover:bg-red-600 hover:scale-110"
                        }`}>
                          {order.payment}
                          {order.payment === "Unpaid" && (
                            <span className="ml-2 animate-pulse"></span>
                          )}
                        </span>
                      </td>
                      <td
                        className="py-4 px-6 cursor-pointer"
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setIsStatusOpen(true);
                        }}
                      >
                        <span className={`px-4 py-1.5 rounded-full text-white font-bold text-xs ${
                          order.status === "Delivered" || order.status === "Hoàn thành" ? "bg-green-500" :
                          order.status === "Delivering" || order.status === "Đang giao" ? "bg-orange-500" :
                          order.status === "Preparing" || order.status === "Đang chuẩn bị" ? "bg-purple-500" :
                          order.status === "Confirmed" || order.status === "Đã xác nhận" ? "bg-blue-500" :
                          order.status === "Pending" || order.status === "Chờ xác nhận" ? "bg-yellow-500" :
                          "bg-red-500"
                        }`}>
                          {order.status === "done" ? "Hoàn thành" :
                          order.status === "delivering" ? "Đang giao" :
                          order.status === "preparing" ? "Đang chuẩn bị" :
                          order.status === "confirmed" ? "Đã xác nhận" :
                          order.status === "pending" ? "Chờ xác nhận" :
                          order.status === "canceled" ? "Đã hủy" : order.status}
                      </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PHÂN TRANG SIÊU ĐẸP - KIỂU SHOPEE */}
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

                        <SelectOrderStatusModal 
                          open={isStatusOpen} 
                          onClose={() => setIsStatusOpen(false)} 
                          onApply={handleChangeStatus} 
    />
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
                &nbsp;• Tổng <strong>{filteredOrders.length}</strong> đơn hàng
              </p>
            </div>
          </>
        )}
      </div>

      <SelectPaymentModal open={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onApply={() => {}} />
      <SelectOrderStatusModal open={isStatusOpen} onClose={() => setIsStatusOpen(false)} onApply={handleChangeStatus} />
      <SelectDateModal open={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} onApply={() => {}} />
    </div>
  );
}