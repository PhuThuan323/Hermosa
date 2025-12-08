import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    // Mock auth
    nav('/dashboard')
  }

  return (
    <div className="min-h-screen grid place-items-center bg-surface">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-panel border border-border rounded-xl p-6 space-y-4 shadow-soft">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-inkDim text-sm mt-1">Sign in to your account</p>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-inkDim">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} required className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="you@example.com" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-inkDim">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="••••••••" />
        </div>
        <button type="submit" className="w-full py-2 bg-primary text-primaryFg rounded-lg hover:opacity-95">Sign in</button>
      </form>
    </div>
  )
}
