import type { InvoiceLineItem } from '@/types'

export type LineResolution = 'auto-confident' | 'auto-flagged' | 'user-reassigned' | 'user-created' | 'excluded'

export interface ReviewRow extends InvoiceLineItem {
  id: string
  resolution: LineResolution
  createdItemId?: string
}

// Below this, a row is flagged and blocks Apply until the user resolves it.
export const BLOCKING_CONFIDENCE = 0.6
// At or above this, a row is shown as a high-confidence match with no visual flag.
export const HIGH_CONFIDENCE = 0.85

export function toReviewRows(lineItems: InvoiceLineItem[]): ReviewRow[] {
  return lineItems.map((line, i) => ({
    ...line,
    id: `${i}-${line.extractedName}`,
    resolution: line.matchedItemId && line.confidence >= BLOCKING_CONFIDENCE ? 'auto-confident' : 'auto-flagged',
  }))
}

export function isRowBlocking(row: ReviewRow): boolean {
  return row.resolution === 'auto-flagged'
}

// A row with quantity 0 and no new item to create wouldn't change anything if applied —
// e.g. an order-guide line the user never filled in. Excluding it from "changes" keeps
// zero-quantity lines from writing no-op entries into the history log.
export function rowHasEffect(row: ReviewRow): boolean {
  return row.resolution === 'user-created' || row.quantity !== 0
}

export function canApply(rows: ReviewRow[]): boolean {
  return rows.some((r) => r.resolution !== 'excluded' && rowHasEffect(r)) && !rows.some(isRowBlocking)
}

export function confidenceBadge(row: ReviewRow): { label: string; tone: 'high' | 'medium' | 'low' } {
  if (row.resolution === 'user-created') return { label: 'New item', tone: 'high' }
  if (row.resolution === 'user-reassigned') return { label: 'Matched', tone: 'high' }
  if (!row.matchedItemId || row.confidence < BLOCKING_CONFIDENCE) return { label: 'Needs review', tone: 'low' }
  if (row.confidence < HIGH_CONFIDENCE) return { label: 'Check this', tone: 'medium' }
  return { label: 'High match', tone: 'high' }
}
