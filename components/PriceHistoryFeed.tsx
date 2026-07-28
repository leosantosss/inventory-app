import type { PriceLogEntry, PriceField } from '@/types'

function groupByDate(entries: PriceLogEntry[]) {
  const groups: { label: string; entries: PriceLogEntry[] }[] = []
  const seen = new Map<string, number>()

  for (const entry of entries) {
    const d = new Date(entry.createdAt)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    let label: string
    if (d.toDateString() === today.toDateString()) {
      label = 'Today — ' + d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday — ' + d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    } else {
      label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    }

    if (!seen.has(label)) {
      seen.set(label, groups.length)
      groups.push({ label, entries: [] })
    }
    groups[seen.get(label)!].entries.push(entry)
  }

  return groups
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const fieldLabels: Record<PriceField, string> = {
  unitsPerBox: 'Units/Box',
  boxPrice: 'Box Price',
  minStock: 'Min Stock',
}

function formatValue(field: PriceField, value: number | null) {
  if (value == null) return '—'
  return field === 'boxPrice' ? `$${value.toFixed(2)}` : String(value)
}

function PriceLogCard({ entry }: { entry: PriceLogEntry }) {
  const isImport = entry.source === 'csv-import'

  return (
    <div className="print-card mb-4 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-stretch">
        <div className="w-1 shrink-0 bg-forest print-accent" />
        <div className="flex-1 px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-start justify-between gap-4 print-session-head">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-forest text-white print-badge">
                {isImport ? 'CSV Import' : 'Manual'}
              </span>
              <span className="text-xs text-gray-400 print-muted">by {entry.displayName}</span>
            </div>
            <p className="text-sm font-medium text-gray-700 mt-1">{entry.itemName}</p>
          </div>
          <span className="text-xs text-gray-400 shrink-0 mt-0.5 font-mono print-muted">{formatTime(entry.createdAt)}</span>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200">Field</th>
            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200">Before</th>
            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">After</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entry.changes.map((change, i) => (
            <tr key={change.field} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">{fieldLabels[change.field]}</td>
              <td className="px-4 py-2 text-sm text-gray-500 text-right tabular-nums border-r border-gray-200">
                {formatValue(change.field, change.oldValue)}
              </td>
              <td className="px-4 py-2 text-sm text-gray-800 text-right tabular-nums font-semibold print-plain">
                {formatValue(change.field, change.newValue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PriceHistoryFeed({ entries }: { entries: PriceLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No price changes in the last 30 days.</p>
      </div>
    )
  }

  const groups = groupByDate(entries)

  return (
    <div>
      {groups.map((group) => (
        <div key={group.label} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          {group.entries.map((entry) => (
            <PriceLogCard key={entry._id} entry={entry} />
          ))}
        </div>
      ))}
    </div>
  )
}
