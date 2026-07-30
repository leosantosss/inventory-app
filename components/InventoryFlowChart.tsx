'use client'
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import type { MonthlyFlowPoint } from '@/lib/inventoryFlowTypes'

const RECEIVED_COLOR = '#059669'
const DEPLETED_COLOR = '#991B1B'
const NET_COLOR = '#1B4332'

// Restock/depletion values can be tiny (a fresh dataset, a low-volume month) or in the
// thousands — fixed 0-decimal formatting collapses distinct small ticks into duplicate
// labels (e.g. 0.5 and 1.5 both reading "$1"/"$2"), so precision adapts to the data's scale.
function makeCurrencyFormatter(maxAbs: number) {
  const maximumFractionDigits = maxAbs < 10 ? 2 : maxAbs < 100 ? 1 : 0
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits })
  return (v: number) => formatter.format(v)
}

function CustomTooltip({ active, payload, label, formatCurrency }: { active?: boolean; payload?: { payload: MonthlyFlowPoint }[]; label?: string; formatCurrency: (v: number) => string }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-emerald-700">Received: {formatCurrency(point.received)}</p>
      <p className="text-crimson-800">Depleted: {formatCurrency(point.depleted)}</p>
      <p className="text-forest font-semibold mt-1">Net: {formatCurrency(point.net)}</p>
    </div>
  )
}

export default function InventoryFlowChart({ data }: { data: MonthlyFlowPoint[] }) {
  const chartData = data.map((d) => ({ ...d, depletedNeg: -d.depleted }))
  const hasActivity = data.some((d) => d.received > 0 || d.depleted > 0)
  const maxAbs = Math.max(1, ...data.flatMap((d) => [d.received, d.depleted, Math.abs(d.net)]))
  const formatCurrency = makeCurrencyFormatter(maxAbs)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-700">Inventory Flow</h2>
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: RECEIVED_COLOR }} />Received</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: DEPLETED_COLOR }} />Depleted</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: NET_COLOR }} />Net</span>
        </div>
      </div>
      {!hasActivity ? (
        <p className="text-sm text-gray-400 py-10 text-center">No restock or depletion activity in this window yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCurrency}
              width={64}
            />
            <ReferenceLine y={0} stroke="#e5e7eb" />
            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
            <Legend wrapperStyle={{ display: 'none' }} />
            <Bar dataKey="received" name="Received" stackId="flow" fill={RECEIVED_COLOR} radius={[4, 4, 0, 0]} />
            <Bar dataKey="depletedNeg" name="Depleted" stackId="flow" fill={DEPLETED_COLOR} radius={[0, 0, 4, 4]} />
            <Line type="monotone" dataKey="net" name="Net" stroke={NET_COLOR} strokeWidth={2} dot={{ r: 3, fill: NET_COLOR }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
