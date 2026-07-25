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

export function canApply(rows: ReviewRow[]): boolean {
  return rows.some((r) => r.resolution !== 'excluded') && !rows.some(isRowBlocking)
}

export function confidenceBadge(row: ReviewRow): { label: string; tone: 'high' | 'medium' | 'low' } {
  if (!row.matchedItemId || row.confidence < BLOCKING_CONFIDENCE) return { label: 'Needs review', tone: 'low' }
  if (row.confidence < HIGH_CONFIDENCE) return { label: 'Check this', tone: 'medium' }
  return { label: 'High match', tone: 'high' }
}
