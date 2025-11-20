import React from 'react'

export default function DataTable({ columns, rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-panel">
      <table className="w-full text-left">
        <thead className="bg-surfaceAlt/60 border-b border-border text-inkDim">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 text-sm font-medium">{c.header}</th>
            ))}
          </tr>
        </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-border/60 hover:bg-surfaceAlt/30 text-sm">
            {columns.map((c) => (
              <td key={c.key} className="px-4 py-3">{r[c.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  )
}
