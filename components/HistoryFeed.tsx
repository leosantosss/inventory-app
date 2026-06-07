import type { HistoryEntry } from '@/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

function DeltaBadge({ delta }: { delta: number }) {
  const positive = delta >= 0
  return (
    <span className={`text-sm font-mono ${positive ? 'text-green-600' : 'text-red-600'}`}>
      {positive ? '+' : ''}{delta}
    </span>
  )
}

function SessionCard({ entry }: { entry: HistoryEntry }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mr-2 ${
            entry.direction === 'in' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {entry.direction === 'in' ? '▲ In' : '▼ Out'}
          </span>
          <span className="text-sm font-semibold text-gray-800">{entry.displayName}</span>
        </div>
        <span className="text-xs text-gray-400">{formatDate(entry.createdAt)}</span>
      </div>
      <p className="text-sm text-gray-600 mb-3 italic">&quot;{entry.note}&quot;</p>
      <div className="flex flex-col gap-1">
        {entry.logs.map((log) => (
          <div key={log._id} className="flex justify-between text-sm">
            <span className="text-gray-700">{log.itemName}</span>
            <div className="flex items-center gap-2 text-gray-500">
              <span>{log.oldValue} → {log.newValue} {log.unit}</span>
              <DeltaBadge delta={log.delta} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HistoryFeed({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-center text-gray-400 py-20">No updates in the last 30 days.</p>
  }
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">History</h1>
      {entries.map((entry) => (
        <SessionCard key={entry._id} entry={entry} />
      ))}
    </div>
  )
}
