// src/components/Topbar.jsx
import React, { useState, useEffect } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import adminAvatar from "../assets/logo.png";

// DỄ THAY AVATAR: CHỈ CẦN ĐỔI 1 DÒNG NÀY THÔI BÉ ƠI!!!
const ADMIN_AVATAR = adminAvatar; // THAY ẢNH CỦA BÉ VÀO ĐÂY NÈ!!!
// Hoặc ảnh local: "/assets/avatar-hermosa.jpg"

export default function Topbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  // Gửi sự kiện tìm kiếm toàn cục khi bé gõ
  useEffect(() => {
    const trimmed = searchQuery.trim();
    window.dispatchEvent(new CustomEvent("globalSearch", { detail: trimmed }));
  }, [searchQuery]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard": return "Dashboard";
      case "/products": return "Quản lý sản phẩm";
      case "/orders": return "Quản lý đơn hàng";
      case "/customers": return "Quản lý khách hàng";
      default: return "Hermosa Coffee Admin";
    }
  };

  return (
    <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-6">
        {/* THANH SEARCH SIÊU MƯỢT - HOẠT ĐỘNG THẬT 100% */}
        <div className="relative w-96">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm sản phẩm, đơn hàng (#123), khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 bg-pink-50/70 border border-pink-200 rounded-2xl text-sm font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-pink-600 text-xl font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative p-2.5 rounded-xl hover:bg-pink-50 transition">
          <Bell size={22} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        <div className="flex items-center gap-3 cursor-pointer hover:bg-pink-50/70 px-4 py-2 rounded-2xl transition">
          <img
            src={ADMIN_AVATAR}
            alt="Hermosa Bé"
            className="w-11 h-11 rounded-full object-cover border-3 border-pink-300 shadow-lg"
            onError={(e) => e.target.src = "https://i.pravatar.cc/48?img=47"}
          />
          <div className="hidden md:block">
            <p className="font-bold text-gray-800">Hermosa</p>
            <p className="text-xs text-pink-600 font-bold">Nữ hoàng Admin</p>
          </div>
          <ChevronDown size={18} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
}