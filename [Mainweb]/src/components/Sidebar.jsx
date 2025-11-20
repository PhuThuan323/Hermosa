import React from 'react'
import { NavLink } from 'react-router-dom'

const linkBase = "flex items-center gap-3 px-4 py-3 rounded-xl transition";
const icon = (d) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d={d} />
  </svg>
)

export default function Sidebar() {
  return (
<aside className="bg-surfaceAlt text-ink h-full border-r border-border p-4">
        <div className="px-2 pt-6 pb-3 text-center">
  <h1 className="font-[PlayfairDisplay] text-3xl text-[#2B2B2B] tracking-wide">Hermosa</h1>
</div>
      <nav className="mt-4 space-y-1">
        <NavLink to="/dashboard" className={({isActive}) =>`${linkBase} ${isActive ? 'bg-primary text-primaryFg shadow-soft' : 'text-ink hover:bg-primary/10 hover:text-primary'}`}>
          {icon("M3 12l9-9 9 9M5 10v10h14V10")} <span>Dashboard</span>
        </NavLink>
        <NavLink to="/orders" className={({isActive}) =>`${linkBase} ${isActive ? 'bg-primary text-primaryFg shadow-soft' : 'text-ink hover:bg-primary/10 hover:text-primary'}`}>
          {icon("M3 7h18M3 12h18M3 17h18")} <span>Orders</span>
        </NavLink>
        <NavLink to="/customers" className={({isActive}) =>`${linkBase} ${isActive ? 'bg-primary text-primaryFg shadow-soft' : 'text-ink hover:bg-primary/10 hover:text-primary'}`}>
          {icon("M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v3h16v-3c0-2.761-3.582-5-8-5z")} <span>Customers</span>
        </NavLink>
        <NavLink to="/products" className={({isActive}) =>`${linkBase} ${isActive ? 'bg-primary text-primaryFg shadow-soft' : 'text-ink hover:bg-primary/10 hover:text-primary'}`}>
          {icon("M4 7l8-4 8 4v10l-8 4-8-4z")} <span>Products</span>
        </NavLink>
        <NavLink to="/staff" className={({isActive}) =>`${linkBase} ${isActive ? 'bg-primary text-primaryFg shadow-soft' : 'text-ink hover:bg-primary/10 hover:text-primary'}`}>
          {icon("M12 12h.01 M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2 M22 13a18.15 18.15 0 0 1-20 0 M2 6h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z")} <span>Staff Managent</span>
        </NavLink>
      </nav>
    </aside>
  )
}
