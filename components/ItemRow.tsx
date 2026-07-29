import type { ItemDoc } from '@/types'
import { itemQuantity, isLowStock } from '@/lib/itemCalc'

interface ChangeInfo {
  oldValue: number
  newValue: number
}

interface Props {
  item: ItemDoc
  onEdit: (item: ItemDoc) => void
  sessionMode?: boolean
  changeInfo?: ChangeInfo
  onQuickUpdate?: () => void
}

const categoryLabels: Record<ItemDoc['category'], string> = {
  cooler: 'Cooler',
  dry: 'Dry Storage',
  bar: 'Bar',
}

export default function ItemRow({ item, onEdit, sessionMode, changeInfo, onQuickUpdate }: Props) {
  const quantity = itemQuantity(item)
  const unitLabel = item.unit === 'count' ? 'ct' : 'lbs'
  const low = isLowStock(item)
  const changed = !!changeInfo

  return (
    <tr
      onClick={sessionMode ? onQuickUpdate : undefined}
      className={`${changed ? 'bg-forest-100' : low ? 'bg-crimson-50' : 'bg-white'} ${
        sessionMode ? 'cursor-pointer hover:bg-forest-50' : 'hover:bg-gray-50'
      }`}
    >
      <td className="px-4 py-3 text-sm font-medium text-gray-800">
        <div className="flex flex-col">
          <span>{item.name}</span>
          {item.subcategory && (
            <span className="text-[11px] text-forest-400 capitalize font-normal">{item.subcategory}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">{categoryLabels[item.category]}</td>
      <td className="px-4 py-3 text-sm text-right">
        {sessionMode ? (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-semibold tabular-nums transition-colors ${
              changed
                ? 'border-forest bg-white text-forest'
                : 'border-gray-200 bg-white text-gray-700 shadow-sm'
            }`}
          >
            {changed ? (
              <>{changeInfo!.oldValue} <span className="text-forest-400">→</span> {changeInfo!.newValue}</>
            ) : (
              quantity ?? '—'
            )}
          </span>
        ) : (
          <>
            <span className={low ? 'font-semibold text-crimson-800' : 'text-gray-800'}>{quantity ?? '—'}</span>
            {low && (
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wide bg-crimson-800 text-white px-1.5 py-0.5 rounded">
                Low
              </span>
            )}
          </>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-300">{unitLabel}</td>
      <td className="px-2 py-3 text-right">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(item) }}
          className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-gray-300 hover:text-forest hover:bg-forest-50 transition-colors"
          aria-label={`Edit ${item.name}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </td>
    </tr>
  )
}
