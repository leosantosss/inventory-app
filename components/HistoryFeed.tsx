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

function LogRow({ log, index }: { log: LogDoc; index: number }) {
  const isAdded = log.isNewItem
  const delta = log.delta
  const bg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50'

  return (
    <tr className={bg}>
      <td className="px-4 py-2 text-sm text-gray-800 border-r border-gray-200">
        {log.itemName}
        {isAdded && <span className="ml-2 text-xs text-blue-500 font-medium">(new)</span>}
      </td>
      <td className="px-4 py-2 text-sm text-gray-500 text-right tabular-nums border-r border-gray-200">
        {isAdded ? '—' : `${log.oldValue} ${log.unit}`}
      </td>
      <td className="px-4 py-2 text-sm text-gray-800 text-right tabular-nums border-r border-gray-200">
        {log.newValue} {log.unit}
      </td>
      <td className="px-4 py-2 text-right">
        {isAdded ? (
          <span className="text-xs font-semibold text-blue-600">Added</span>
        ) : (
          <span className={`text-sm font-semibold tabular-nums ${
            delta > 0 ? 'text-forest' : delta < 0 ? 'text-crimson-800' : 'text-gray-400'
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
  const accentColor = isIn ? '#1B4332' : '#7F1D1D'

  return (
    <div className="print-card mb-4 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Session header */}
      <div className="flex items-stretch">
        <div className="w-1 shrink-0" style={{ backgroundColor: accentColor }} />
        <div className="flex-1 px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ backgroundColor: accentColor, color: 'white' }}
              >
                {isIn ? '▲ Bringing In' : '▼ Taking Out'}
              </span>
              <span className="text-xs text-gray-400">by {entry.displayName}</span>
            </div>
            <p className="text-sm font-medium text-gray-700 mt-1">{entry.note}</p>
          </div>
          <span className="text-xs text-gray-400 shrink-0 mt-0.5 font-mono">{formatTime(entry.createdAt)}</span>
        </div>
      </div>

      {/* Log table */}
      {entry.logs.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200">Item</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200">Before</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide border-r border-gray-200">After</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entry.logs.map((log, i) => (
              <LogRow key={log._id} log={log} index={i} />
            ))}
          </tbody>
        </table>
      ) : (
        <p className="px-4 py-3 text-xs text-gray-400 italic">No item changes recorded.</p>
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
      {!hideTitle && <h1 className="font-display text-2xl font-bold text-forest mb-6">History</h1>}
      {groups.map((group) => (
        <div key={group.label} className="mb-8">
          {/* Date section header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          {group.entries.map((entry) => (
            <SessionCard key={entry._id} entry={entry} />
          ))}
        </div>
      ))}
    </div>
  )
}
