'use client'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useToast } from '@/context/ToastContext'
import AddItemModal from './AddItemModal'
import InvoiceLineMatchPicker from './InvoiceLineMatchPicker'
import { toReviewRows, canApply, confidenceBadge, rowHasEffect, BLOCKING_CONFIDENCE, type ReviewRow } from '@/lib/invoiceImportHelpers'
import type { InvoiceExtractionResult, ItemDoc, Category } from '@/types'

const categoryOptions: { label: string; value: Category }[] = [
  { label: 'Cooler', value: 'cooler' },
  { label: 'Bar', value: 'bar' },
  { label: 'Dry Storage', value: 'dry' },
]

const badgeClasses: Record<'high' | 'medium' | 'low', string> = {
  high: 'bg-forest-100 text-forest-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-crimson-100 text-crimson-800',
}

function StatChip({ label, value, tone = 'gray' }: { label: string; value: number; tone?: 'forest' | 'crimson' | 'gray' }) {
  const colors: Record<string, string> = { forest: 'text-forest', crimson: 'text-crimson-800', gray: 'text-gray-700' }
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3 flex flex-col gap-0.5 flex-1 min-w-[120px]">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${colors[tone]}`}>{value}</span>
    </div>
  )
}

interface Props {
  result: InvoiceExtractionResult
  onBack: () => void
  onApplied: () => void
}

export default function InvoiceReviewTable({ result, onBack, onApplied }: Props) {
  const { showToast } = useToast()
  const [items, setItems] = useState<ItemDoc[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [rows, setRows] = useState<ReviewRow[]>([])
  const [note, setNote] = useState(`Invoice import — ${result.vendorGuess ?? result.fileName}`)
  const [pickerForRowId, setPickerForRowId] = useState<string | null>(null)
  const [creatingForRow, setCreatingForRow] = useState<ReviewRow | null>(null)
  const [creatingCategory, setCreatingCategory] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/items')
      .then((res) => res.json())
      .then((fetched: ItemDoc[]) => {
        setItems(fetched)
        const catalogIds = new Set(fetched.map((i) => i._id))
        const initialRows = toReviewRows(result.lineItems).map((row) =>
          row.matchedItemId && !catalogIds.has(row.matchedItemId)
            ? { ...row, resolution: 'auto-flagged' as const, matchedItemId: null, matchedItemName: null }
            : row
        )
        setRows(initialRows)
        setLoadingCatalog(false)
      })
      .catch(() => {
        showToast('Could not load your item catalog — try going back and re-uploading.', 'error')
        setLoadingCatalog(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const catalogById = useMemo(() => new Map(items.map((i) => [i._id, i])), [items])
  const applyEnabled = !loadingCatalog && rows.length > 0 && canApply(rows)
  const blockingCount = rows.filter((r) => r.resolution === 'auto-flagged').length
  const excludedCount = rows.filter((r) => r.resolution === 'excluded').length
  const matchedCount = rows.length - blockingCount - excludedCount

  function updateRow(id: string, patch: Partial<ReviewRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function toggleExclude(id: string) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        if (r.resolution === 'excluded') {
          return { ...r, resolution: r.matchedItemId && r.confidence >= BLOCKING_CONFIDENCE ? 'auto-confident' : 'auto-flagged' }
        }
        return { ...r, resolution: 'excluded' }
      })
    )
  }

  function selectMatch(rowId: string, item: ItemDoc) {
    updateRow(rowId, { matchedItemId: item._id, matchedItemName: item.name, resolution: 'user-reassigned' })
    setPickerForRowId(null)
  }

  function handleItemCreated(newItem: ItemDoc) {
    if (!creatingForRow) return
    setItems((prev) => [...prev, newItem])
    updateRow(creatingForRow.id, {
      matchedItemId: newItem._id,
      matchedItemName: newItem.name,
      resolution: 'user-created',
      createdItemId: newItem._id,
    })
    setCreatingForRow(null)
    setCreatingCategory(null)
  }

  async function handleApply() {
    setSubmitting(true)
    try {
      const includedRows = rows.filter((r) => r.resolution !== 'excluded' && r.resolution !== 'user-created')
      const changes = includedRows
        .filter((r) => r.matchedItemId && r.quantity !== 0)
        .map((r) => {
          const item = catalogById.get(r.matchedItemId!)
          const base = item ? (item.unit === 'count' ? item.currentCount ?? 0 : item.currentLbs ?? 0) : 0
          return { itemId: r.matchedItemId, newValue: base + r.quantity }
        })
      const newItemIds = rows.filter((r) => r.resolution === 'user-created' && r.createdItemId).map((r) => r.createdItemId!)

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: 'in', note, changes, newItemIds }),
      })
      if (!res.ok) throw new Error('Failed to apply')

      showToast(`Invoice applied — ${changes.length + newItemIds.length} item(s) updated`)
      onApplied()
    } catch {
      showToast('Could not save this update — check your connection and try again.', 'error')
      setSubmitting(false)
    }
  }

  if (loadingCatalog) {
    return <p className="text-center text-gray-400 py-16">Loading your item catalog…</p>
  }

  if (rows.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 flex flex-col items-center gap-4">
        <p className="text-gray-500">We couldn&apos;t find any line items on this invoice. Try a clearer photo, or check this is the right file.</p>
        <button onClick={onBack} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold shadow-sm hover:bg-gray-50 transition">
          Try another file
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold text-forest">Review Invoice</h1>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800">
          &larr; Try another file
        </button>
      </div>

      <div className="flex gap-3 flex-wrap mb-4">
        <StatChip label="Line Items" value={rows.length} />
        <StatChip label="Matched" value={matchedCount} tone="forest" />
        <StatChip label="Needs Review" value={blockingCount} tone={blockingCount > 0 ? 'crimson' : 'gray'} />
        <StatChip label="Excluded" value={excludedCount} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-left">Line Item</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-left">Match</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Qty</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {rows.map((row) => {
              const badge = confidenceBadge(row)
              const excluded = row.resolution === 'excluded'
              const reasoningOpen = expandedReasoning === row.id
              return (
                <Fragment key={row.id}>
                  <tr className={`transition-opacity ${excluded ? 'opacity-40' : badge.tone === 'low' ? 'bg-crimson-50' : ''}`}>
                    <td className="px-4 py-3 align-top max-w-xs">
                      <p className="text-[11px] text-gray-400 truncate">{row.rawText}</p>
                      <p className="text-sm font-semibold text-gray-800">{row.extractedName}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-block px-2 py-1 rounded-full text-[11px] font-semibold ${badgeClasses[badge.tone]}`}>
                        {badge.label}
                      </span>
                      <div className="text-sm text-gray-600 mt-1">
                        {row.matchedItemName ? (
                          <span>Matches <span className="font-medium text-gray-800">{row.matchedItemName}</span></span>
                        ) : (
                          <span className="text-crimson-700">No match found</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          step="1"
                          value={row.quantity}
                          onChange={(e) => updateRow(row.id, { quantity: parseFloat(e.target.value) || 0 })}
                          disabled={excluded}
                          className="w-20 border border-gray-200 rounded-lg px-2 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-forest-500 disabled:bg-gray-100"
                        />
                        <span className="text-xs text-gray-400 whitespace-nowrap">{row.unit ?? 'units'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => setPickerForRowId(row.id)}
                          disabled={excluded}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-40 whitespace-nowrap"
                        >
                          Change match
                        </button>
                        <button
                          onClick={() => { setCreatingForRow(row); setCreatingCategory(null) }}
                          disabled={excluded}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-40 whitespace-nowrap"
                        >
                          Create new item
                        </button>
                        <button
                          onClick={() => toggleExclude(row.id)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition whitespace-nowrap"
                        >
                          {excluded ? 'Include' : 'Exclude'}
                        </button>
                        <button
                          onClick={() => setExpandedReasoning(reasoningOpen ? null : row.id)}
                          className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap"
                        >
                          why?
                        </button>
                      </div>
                    </td>
                  </tr>
                  {reasoningOpen && (
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-4 py-2 text-xs text-gray-500 italic">
                        {row.reasoning}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {pickerForRowId && (
        <InvoiceLineMatchPicker
          catalog={items}
          onSelect={(item) => selectMatch(pickerForRowId, item)}
          onClose={() => setPickerForRowId(null)}
        />
      )}

      {creatingForRow && !creatingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-[60] animate-backdrop-in" onClick={() => setCreatingForRow(null)}>
          <div className="bg-white w-full rounded-t-3xl pb-8 animate-sheet-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />
            <div className="px-6">
              <h2 className="font-display text-lg font-bold text-forest mb-4">Which shelf does this belong to?</h2>
              <div className="flex flex-col gap-2">
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setCreatingCategory(opt.value)}
                    className="px-4 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-forest hover:text-white transition-colors text-left"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {creatingForRow && creatingCategory && (
        <AddItemModal
          category={creatingCategory}
          initialName={creatingForRow.extractedName}
          initialStartingValue={creatingForRow.quantity}
          initialUnitsPerBox={creatingForRow.invoicePackSize}
          unitsPerBoxNeedsReview={creatingForRow.isCaseQuantity && !creatingForRow.invoicePackSize}
          initialBoxPrice={creatingForRow.invoicePrice}
          boxPriceNeedsReview={creatingForRow.isCaseQuantity && !creatingForRow.invoicePrice}
          onClose={() => { setCreatingForRow(null); setCreatingCategory(null) }}
          onSaved={handleItemCreated}
        />
      )}

      <div className="sticky bottom-0 -mx-4 bg-white border-t border-gray-200 px-4 py-3 z-40 animate-fade-in">
        <div className="flex items-center gap-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
          />
          <button
            onClick={handleApply}
            disabled={!applyEnabled || submitting}
            className="shrink-0 px-8 bg-forest hover:bg-forest-600 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 transition active:scale-[0.98] whitespace-nowrap"
          >
            {submitting ? 'Applying…' : `Apply ${rows.filter((r) => r.resolution !== 'excluded' && rowHasEffect(r)).length} item(s)`}
          </button>
          {blockingCount > 0 && (
            <span className="shrink-0 text-xs text-crimson-700 whitespace-nowrap">{blockingCount} need{blockingCount === 1 ? 's' : ''} review</span>
          )}
        </div>
      </div>
    </div>
  )
}
