import type { HistoryEntry, LogDoc } from '@/types'

function groupByDate(entries: HistoryEntry[]) {
  const groups: { label: string; entries: HistoryEntry[] }[] = []
  const seen = new Map<string, number>()

  for (const entry of entries) {
    const d = new Date(entry.createdAt)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    let label: string
    if (d.toDateString() === today.toDateString()) {
      label = 'Today'
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday'
    } else {
      label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
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

function LogRow({ log }: { log: LogDoc }) {
  const isAdded = log.isNewItem
  const delta = log.delta

  return (
    <tr className="border-t border-gray-100">
      <td className="py-2 pr-4 text-sm text-gray-800 font-medium">{log.itemName}</td>
      <td className="py-2 pr-4 text-sm text-gray-400 text-center">
        {isAdded ? (
          <span className="text-blue-500 text-xs font-medium">new item</span>
        ) : (
          <span>{log.oldValue} → {log.newValue} <span className="text-gray-300">{log.unit}</span></span>
        )}
      </td>
      <td className="py-2 text-right">
        {isAdded ? (
          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
            Added
          </span>
        ) : (
          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
            delta > 0
              ? 'bg-emerald-50 text-emerald-700'
              : delta < 0
              ? 'bg-red-50 text-red-600'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {delta > 0 ? '+' : ''}{delta}
          </span>
        )}
      </td>
    </tr>
  )
}

function SessionCard({ entry }: { entry: HistoryEntry }) {
  const isIn = entry.direction === 'in'

  return (
    <div className="print-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-3">
      {/* Card header */}
      <div className={`px-4 py-3 flex items-start justify-between gap-3 ${
        isIn ? 'bg-forest' : 'bg-crimson'
      }`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white text-xs font-bold uppercase tracking-wider">
              {isIn ? '▲ Bringing In' : '▼ Taking Out'}
            </span>
            <span className="text-white/50 text-xs">·</span>
            <span className="text-white/80 text-xs">{entry.displayName}</span>
          </div>
          <p className="text-white/90 text-sm truncate">{entry.note}</p>
        </div>
        <span className="text-white/60 text-xs shrink-0 mt-0.5">{formatTime(entry.createdAt)}</span>
      </div>

      {/* Log table */}
      {entry.logs.length > 0 ? (
        <div className="px-4 pb-3">
          <table className="w-full">
            <thead>
              <tr>
                <th className="pt-3 pb-1 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4">Item</th>
                <th className="pt-3 pb-1 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4">Change</th>
                <th className="pt-3 pb-1 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Qty</th>
              </tr>
            </thead>
            <tbody>
              {entry.logs.map((log) => (
                <LogRow key={log._id} log={log} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-4 py-3 text-xs text-gray-400">No item changes recorded.</p>
      )}
    </div>
  )
}

export default function HistoryFeed({ entries, hideTitle }: { entries: HistoryEntry[]; hideTitle?: boolean }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No updates in the last 30 days.</p>
      </div>
    )
  }

  const groups = groupByDate(entries)

  return (
    <div>
      {!hideTitle && <h1 className="font-display text-2xl font-bold text-forest mb-4">History</h1>}
      {groups.map((group) => (
        <div key={group.label} className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{group.label}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          {group.entries.map((entry) => (
            <SessionCard key={entry._id} entry={entry} />
          ))}
        </div>
      ))}
    </div>
  )
}
