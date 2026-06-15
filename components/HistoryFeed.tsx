import type { HistoryEntry } from '@/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

function DeltaBadge({ delta, isNewItem }: { delta: number; isNewItem?: boolean }) {
  if (isNewItem) {
    return (
      <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-600">
        Added
      </span>
    )
  }
  const positive = delta >= 0
  return (
    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
      positive ? 'bg-forest-100 text-forest' : 'bg-crimson-100 text-crimson'
    }`}>
      {positive ? '+' : ''}{delta}
    </span>
  )
}

function SessionCard({ entry }: { entry: HistoryEntry }) {
  return (
    <div className="bg-white rounded-2xl border-l-4 p-4 mb-3 shadow-sm" style={{
      borderLeftColor: entry.direction === 'in' ? '#2D6A4F' : '#B91C1C'
    }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            entry.direction === 'in'
              ? 'bg-forest-100 text-forest-600'
              : 'bg-crimson-100 text-crimson'
          }`}>
            {entry.direction === 'in' ? '▲ In' : '▼ Out'}
          </span>
          <span className="text-sm font-semibold text-gray-800">{entry.displayName}</span>
        </div>
        <span className="text-xs text-gray-400 shrink-0 ml-2">{formatDate(entry.createdAt)}</span>
      </div>
      <p className="text-sm text-gray-500 mb-3 italic">&quot;{entry.note}&quot;</p>
      <div className="flex flex-col gap-1.5">
        {entry.logs.map((log) => (
          <div key={log._id} className="flex justify-between items-center text-sm">
            <span className="text-gray-700 font-medium">{log.itemName}</span>
            <div className="flex items-center gap-2 text-gray-400">
              {!log.isNewItem && (
                <span className="text-xs">{log.oldValue} → {log.newValue} {log.unit}</span>
              )}
              <DeltaBadge delta={log.delta} isNewItem={log.isNewItem} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HistoryFeed({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No updates in the last 30 days.</p>
      </div>
    )
  }
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest mb-4">History</h1>
      {entries.map((entry) => (
        <SessionCard key={entry._id} entry={entry} />
      ))}
    </div>
  )
}
