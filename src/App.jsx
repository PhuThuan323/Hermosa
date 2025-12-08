import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Products from './pages/Products'
import CustomerForm from "./components/CustomerForm";
import VoucherManagement from './pages/Voucher';


export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <div className="grid grid-cols-[280px_1fr] min-h-screen bg-surface">
              <Sidebar />
              <div className="flex flex-col">
                <Topbar />
                <main className="p-6 lg:p-8 space-y-6">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/customers/add" element={<CustomerForm />} />
                    <Route path="/customers/edit/:id" element={<CustomerForm isEdit />} />
                    <Route path="*" element={<div className="text-ink">Not Found</div>} />
                    <Route path="/vouchers" element={<VoucherManagement />} />
                  </Routes>
                </main>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  )
}
