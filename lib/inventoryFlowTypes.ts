import type { Category } from '@/types'

// Fixed hue per category — validated for colorblind-safe separation (see dataviz skill).
export const CATEGORY_COLORS: Record<Category, string> = {
  cooler: '#2563eb',
  bar: '#d97706',
  dry: '#7c3aed',
}

export interface SankeyNode {
  name: string
  color: string
  depth: 0 | 1 | 2
}

export interface SankeyData {
  nodes: SankeyNode[]
  links: { source: number; target: number; value: number }[]
}

export interface MonthlyFlowPoint {
  month: string
  received: number
  depleted: number
  net: number
}
