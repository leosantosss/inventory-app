import type { ItemDoc } from '@/types'

interface Props {
  item: ItemDoc
  onEdit: (item: ItemDoc) => void
}

export default function ItemRow({ item, onEdit }: Props) {
  const value = item.unit === 'count' ? item.currentCount : item.currentLbs
  const label = item.unit === 'count' ? 'ct' : 'lbs'

  return (
    <div className="flex items-center justify-between py-4 px-4 border-b border-gray-100 bg-white">
      <span className="text-lg font-medium text-gray-900">{item.name}</span>
      <div className="flex items-center gap-4">
        <span className="text-lg text-gray-700">
          {value ?? '—'} <span className="text-sm text-gray-400">{label}</span>
        </span>
        <button
          onClick={() => onEdit(item)}
          className="p-2 text-gray-400 hover:text-gray-700"
          aria-label={`Edit ${item.name}`}
        >
          ✏️
        </button>
      </div>
    </div>
  )
}
