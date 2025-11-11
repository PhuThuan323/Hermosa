import React from "react";
import { Search } from "lucide-react"; // built-in icon library, already available with Vite + React setup

export default function Topbar() {
  return (
    <header className="h-[70px] bg-white border-b border-border flex items-center justify-between px-8 shadow-sm">
      {/* Left side: search bar */}
      <div className="flex items-center gap-3 w-[320px]">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#F5F6FA] text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#EF4543]/40"
          />
        </div>
      </div>

      {/* Right side: user info */}
      <div className="flex items-center gap-4">
        {/* Notification and language can go here later if needed */}

        {/* Profile section */}
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/48?img=47" // replace with your own avatar
            alt="Profile"
            className="w-10 h-10 rounded-full border border-gray-200 object-cover"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-gray-800 text-sm">Moni Roy</span>
            <span className="text-xs text-gray-500">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
