import React, { useState, useEffect } from "react";
import { Users, Package, ShoppingCart, TrendingUp, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { toast } from "react-hot-toast";

const API_BASE = "http://34.151.64.207";
const MENU_API = `${API_BASE}/menu`;

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [bestSelling, setBestSelling] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const menuRes = await axios.get(`${MENU_API}/all-product`);
        const menuItems = menuRes.data.status === "Success" ? menuRes.data.data : [];
        const menuMap = {};
        menuItems.forEach(item => {
          menuMap[item.name.toLowerCase()] = {
            image: item.picture,
            price: item.price,
          };
        });

        // Lấy tất cả user
        const userRes = await axios.get(`${API_BASE}/user/view-all-user`);
        const totalUsers = userRes.data.status === "Success" ? userRes.data.data.length : 0;

        // Lấy tất cả đơn hàng
        const orderRes = await axios.get(`${API_BASE}/order/view-all`);
        const orders = orderRes.data.status === "Success" ? orderRes.data.data : [];

        const totalOrders = orders.length;
        const today = format(new Date(), "yyyy-MM-dd");
        const todayOrders = orders.filter(o => 
          format(new Date(o.createAt), "yyyy-MM-dd") === today
        );
        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalInvoice || 0), 0);

        // Top 5 sản phẩm bán chạy (toàn thời gian)
        const productCount = {};
        orders.forEach(order => {
          order.products?.forEach(p => {
            const name = (p.name || "Sản phẩm không tên").trim();
            productCount[name] = (productCount[name] || 0) + (p.quantity || 1);
          });
        });

        const topProducts = Object.entries(productCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, qty]) => {
            const menuItem = menuMap[name.toLowerCase()] || {};
            return {
              product: name,
              order: qty,
              price: menuItem.price ? `${Number(menuItem.price).toLocaleString("vi-VN")}₫` : "N/A",
              img: menuItem.image || "https://i.imgur.com/pN0J7wP.png",
            };
          });

        // DOANH THU THEO THÁNG ĐƯỢC CHỌN
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);
        const days = eachDayOfInterval({ start, end });

        const monthlyRevenue = days.map(day => {
          const dayStr = format(day, "yyyy-MM-dd");
          const dayOrders = orders.filter(o => 
            format(new Date(o.createAt), "yyyy-MM-dd") === dayStr
          );
          const revenue = dayOrders.reduce((sum, o) => sum + (o.totalInvoice || 0), 0);

          return {
            name: format(day, "dd"),
            sales: Math.round(revenue / 1000),
            profit: Math.round(revenue * 0.4 / 1000), 
          };
        });

        setStats({
          totalUsers,
          totalOrders,
          todayOrders: todayOrders.length,
          todayRevenue,
        });
        setBestSelling(topProducts.length > 0 ? topProducts : [
          { product: "Chưa có đơn hàng", order: 0, price: "0₫", img: "" }
        ]);
        setRevenueData(monthlyRevenue);

      } catch (err) {
        console.error("Lỗi Dashboard:", err);
        toast.error("Không tải được dữ liệu Dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedDate]); 

  return (
    <div className="bg-surface min-h-screen px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-16 h-16 animate-spin text-pink-500" />
        </div>
      ) : (
        <>
          {/* TOP STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tổng khách hàng</p>
                  <h3 className="text-3xl font-bold text-pink-600 mt-2">
                    {stats.totalUsers.toLocaleString("vi-VN")}
                  </h3>
                </div>
                <div className="bg-pink-50 p-4 rounded-xl">
                  <Users size={36} className="text-pink-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tổng đơn hàng</p>
                  <h3 className="text-3xl font-bold text-blue-600 mt-2">
                    {stats.totalOrders.toLocaleString("vi-VN")}
                  </h3>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <Package size={36} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 text-sm font-medium">Đơn hàng hôm nay</p>
                  <h3 className="text-4xl font-bold mt-2">{stats.todayOrders}</h3>
                  <p className="text-white/90 text-sm mt-1">
                    {new Intl.NumberFormat("vi-VN").format(stats.todayRevenue)}₫
                  </p>
                </div>
                <ShoppingCart size={48} className="opacity-90" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Doanh thu hôm nay</p>
                  <h3 className="text-3xl font-bold text-pink-600 mt-2">
                    {new Intl.NumberFormat("vi-VN").format(stats.todayRevenue)}₫
                  </h3>
                </div>
                <div className="bg-pink-50 p-4 rounded-xl">
                  <TrendingUp size={36} className="text-pink-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Top sản phẩm */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-5">Top 5 bán chạy</h2>
                <div className="space-y-4">
                  {bestSelling.map((item, i) => (
                    <div key={i} className="flex items-center justify-between hover:bg-pink-50 p-3 rounded-xl transition">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={item.img}
                            alt={item.product}
                            className="w-14 h-14 rounded-xl object-cover shadow border-2 border-pink-100"
                            onError={(e) => e.target.src = "https://i.imgur.com/pN0J7wP.png"}
                          />
                          <span className="absolute -top-2 -right-2 bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {i + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{item.product}</p>
                          <p className="text-xs text-gray-500">{item.order} đơn</p>
                        </div>
                      </div>
                      <p className="font-bold text-pink-600">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Biểu đồ doanh thu + NÚT CHỌN THÁNG */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Doanh thu tháng {format(selectedDate, "MM/yyyy")}
                  </h2>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
                      className="p-2.5 rounded-xl hover:bg-pink-50 transition"
                    >
                      <ChevronLeft size={20} className="text-pink-600" />
                    </button>

                    <span className="font-bold text-pink-600 text-lg">
                      {format(selectedDate, "MM/yyyy")}
                    </span>

                    <button
                      onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                      className="p-2.5 rounded-xl hover:bg-pink-50 transition"
                    >
                      <ChevronRight size={20} className="text-pink-600" />
                    </button>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => `${(value * 1000).toLocaleString("vi-VN")}₫`}
                      labelFormatter={(label) => `Ngày ${label}/${format(selectedDate, "MM/yyyy")}`}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #ddd" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#EC4899"
                      strokeWidth={3}
                      fill="url(#colorSales)"
                      name="Doanh thu"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#A78BFA"
                      strokeWidth={3}
                      fill="url(#colorProfit)"
                      name="Lợi nhuận (ước tính)"
                    />
                  </AreaChart>
                </ResponsiveContainer>

                <div className="flex justify-center gap-8 mt-5 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-pink-500"></span>
                    Doanh thu
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-purple-500"></span>
                    Lợi nhuận (ước tính)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}