import React, { useEffect } from 'react'

export default function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-panel border border-border rounded-xl shadow-soft">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-inkDim hover:text-ink">✕</button>
          </div>
          <div className="p-5">{children}</div>
          {footer && <div className="px-5 py-4 border-t border-border bg-surfaceAlt">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
