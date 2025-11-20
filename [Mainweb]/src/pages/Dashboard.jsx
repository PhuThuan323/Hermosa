import React from "react";
import { Users, Package } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const bestSelling = [
    { product: "Strawberry Cheese", order: 104, price: "85.000₫", img: "https://i.imgur.com/pN0J7wP.png" },
    { product: "Strawberry Donut", order: 56, price: "55.000₫", img: "https://i.imgur.com/lMaOE8O.png" },
    { product: "Matcha Donut", order: 266, price: "50.000₫", img: "https://i.imgur.com/nr0kKqz.png" },
    { product: "Blueberry Cheese", order: 506, price: "85.000₫", img: "https://i.imgur.com/8a4V4VZ.png" },
  ];

  const revenueData = [
    { name: "5k", sales: 20, profit: 40 },
    { name: "10k", sales: 35, profit: 70 },
    { name: "20k", sales: 30, profit: 50 },
    { name: "30k", sales: 50, profit: 30 },
    { name: "40k", sales: 80, profit: 85 },
    { name: "50k", sales: 40, profit: 60 },
    { name: "60k", sales: 60, profit: 100 },
  ];

  return (
    <div className="bg-[#F5F6FA] min-h-screen px-8 py-6 space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>

      {/* ======= TOP SECTION (2-column layout) ======= */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-stretch">
        {/* Left column (40%) */}
            <div className="xl:col-span-2 flex flex-col gap-6 h-full">
              <div className="flex flex-col justify-between h-full">
                <div className="flex flex-col justify-between h-full">
                  <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between border border-gray-100 flex-1">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total User</p>
                      <h2 className="text-3xl font-bold mt-2">40,689</h2>
                      <p className="text-green-600 text-sm mt-1">↑ 8.5% Up from yesterday</p>
                    </div>
                    <div className="bg-[#FBE7E7] p-4 rounded-2xl">
                      <Users size={42} className="text-[#8560A9]" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between border border-gray-100 flex-1 mt-6">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Order</p>
                      <h2 className="text-3xl font-bold mt-2">10,293</h2>
                      <p className="text-green-600 text-sm mt-1">↑ 1.3% Up from past week</p>
                    </div>
                    <div className="bg-[#FFF0D1] p-4 rounded-2xl">
                      <Package size={42} className="text-[#FBB03B]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

        {/* Right column (60%) */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Best selling product</h2>
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-[#FBE7E7] text-gray-800 font-medium">
                <tr>
                  <th className="text-left py-2 px-4">Product</th>
                  <th className="text-left py-2 px-4">Total Order</th>
                  <th className="text-left py-2 px-4">Price</th>
                </tr>
              </thead>
              <tbody>
                {bestSelling.map((item, index) => (
                  <tr key={index} className="border-t border-gray-100 hover:bg-[#FBE7E7]/20">
                    <td className="py-2 px-4 flex items-center gap-3">
                      <img src={item.img} alt={item.product} className="w-8 h-8 rounded-full object-cover" />
                      {item.product}
                    </td>
                    <td className="py-2 px-4">{item.order}</td>
                    <td className="py-2 px-4 font-semibold text-[#0E5D8D]">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ======= REVENUE CHART SECTION ======= */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Revenue</h2>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:ring-1 focus:ring-[#EF4543]/40">
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4543" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#EF4543" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B197F8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#B197F8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#EF4543"
              fillOpacity={1}
              fill="url(#colorSales)"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#B197F8"
              fillOpacity={1}
              fill="url(#colorProfit)"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#EF4543]"></span> Sales
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#B197F8]"></span> Profit
          </div>
        </div>
      </div>
    </div>
  );
}
