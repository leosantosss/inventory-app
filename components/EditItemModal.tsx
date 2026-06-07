import type { ItemDoc } from '@/types'

interface Props {
  item: ItemDoc
  onClose: () => void
  onSaved: () => void
}

export default function EditItemModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={onClose}>
      <div className="bg-white w-full rounded-t-2xl p-6">
        <p className="text-gray-500">Edit item coming soon…</p>
      </div>
    </div>
  )
}
