import type { ItemDoc } from '@/types'

interface Props {
  item: ItemDoc
  onEdit: (item: ItemDoc) => void
}

export default function ItemRow({ item, onEdit }: Props) {
  const value = item.unit === 'count' ? item.currentCount : item.currentLbs
  const label = item.unit === 'count' ? 'ct' : 'lbs'

  return (
    <div className="relative bg-white rounded-2xl p-4 flex flex-col shadow-sm min-h-[110px] border-l-4 border-forest overflow-hidden">
      <button
        onClick={() => onEdit(item)}
        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-forest hover:bg-forest-50 transition-colors"
        aria-label={`Edit ${item.name}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <span className="text-sm font-semibold text-gray-700 pr-7 leading-snug">{item.name}</span>
      {item.subcategory && (
        <span className="text-xs text-forest-400 capitalize mt-0.5">{item.subcategory}</span>
      )}
      <div className="mt-auto pt-3">
        <span className="text-3xl font-bold text-forest">{value ?? '—'}</span>
        <span className="text-xs font-medium text-gray-400 ml-1">{label}</span>
      </div>
    </div>
  )
}
