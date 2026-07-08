'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import HistoryFeed from '@/components/HistoryFeed'
import type { HistoryEntry, Category } from '@/types'

interface LowStockItem {
  _id: string
  name: string
  category: Category
  categoryLabel: string
  quantity: number | null
  unit: string
  minStock: number | null
}

interface DashboardStats {
  totalItems: number
  totalValue: number
  valueByCategory: { category: Category; label: string; value: number }[]
  lowStock: LowStockItem[]
  recentActivity: HistoryEntry[]
}

const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const fullCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function StatTile({ label, value, accent }: { label: string; value: string; accent?: 'crimson' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex flex-col gap-1">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      <span className={`text-3xl font-bold ${accent === 'crimson' ? 'text-crimson-800' : 'text-forest'}`}>
        {value}
      </span>
    </div>
  )
}

function ValueByCategoryChart({ data }: { data: DashboardStats['valueByCategory'] }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Inventory Value by Location</h2>
      <div className="flex flex-col gap-3">
        {data.map((d) => {
          const pct = Math.max(2, (d.value / max) * 100)
          return (
            <div key={d.category} className="flex items-center gap-3">
              <Link
                href={`/inventory/${d.category}`}
                className="w-24 shrink-0 text-sm text-gray-600 hover:text-forest hover:underline"
              >
                {d.label}
              </Link>
              <div className="flex-1 h-6 bg-gray-100 rounded-sm relative">
                <div
                  className="h-6 bg-forest-500 rounded-r-sm"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-20 shrink-0 text-sm font-semibold text-gray-700 text-right tabular-nums">
                {fullCurrency.format(d.value)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LowStockTable({ items }: { items: LowStockItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Low Stock</h2>
        <p className="text-sm text-gray-400">Nothing is below its par level right now.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <h2 className="text-sm font-semibold text-gray-700 px-5 pt-5 pb-3">Low Stock</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-y border-gray-200">
            <th className="px-5 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
            <th className="px-5 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
            <th className="px-5 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantity</th>
            <th className="px-5 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Min</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, i) => (
            <tr key={item._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-5 py-2.5 text-sm font-medium text-gray-800">
                <Link href={`/inventory/${item.category}`} className="hover:text-forest hover:underline">
                  {item.name}
                </Link>
              </td>
              <td className="px-5 py-2.5 text-sm text-gray-500">{item.categoryLabel}</td>
              <td className="px-5 py-2.5 text-sm text-right tabular-nums font-semibold text-crimson-800">
                {item.quantity ?? '—'} {item.unit === 'count' ? 'ct' : 'lbs'}
              </td>
              <td className="px-5 py-2.5 text-sm text-right tabular-nums text-gray-400">{item.minStock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then(setStats)
  }, [])

  if (!stats) {
    return <div className="text-center text-gray-400 py-20">Loading…</div>
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatTile label="Total Inventory Value" value={compactCurrency.format(stats.totalValue)} />
        <StatTile label="Total Items" value={String(stats.totalItems)} />
        <StatTile label="Low on Stock" value={String(stats.lowStock.length)} accent={stats.lowStock.length > 0 ? 'crimson' : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <ValueByCategoryChart data={stats.valueByCategory} />
        <LowStockTable items={stats.lowStock} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Recent Activity</h2>
        {stats.recentActivity.length === 0 ? (
          <p className="text-sm text-gray-400">No updates in the last 30 days.</p>
        ) : (
          <HistoryFeed entries={stats.recentActivity} hideTitle />
        )}
      </div>
    </div>
  )
}
