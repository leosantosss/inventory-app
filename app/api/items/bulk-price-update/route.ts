import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { bulkUpdatePrices } from '@/lib/services/itemService'
import type { Category } from '@/types'

const validCategories: Category[] = ['cooler', 'dry', 'bar']

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!Array.isArray(body.rows)) {
    return NextResponse.json({ error: 'rows must be an array' }, { status: 400 })
  }

  const rows = body.rows.filter(
    (r: { name?: unknown; category?: unknown }) =>
      typeof r.name === 'string' && r.name.trim() && validCategories.includes(r.category as Category)
  )

  const result = await bulkUpdatePrices(rows, {
    userId: (session.user as { id?: string }).id ?? '',
    displayName: session.user?.name ?? 'Unknown',
    source: 'csv-import',
  })

  return NextResponse.json(result)
}
