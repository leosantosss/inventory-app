import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getItemsByCategory, getAllItems, createItem } from '@/lib/services/itemService'
import type { Category, Unit } from '@/types'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const category = request.nextUrl.searchParams.get('category') as Category | null
  const items = category ? await getItemsByCategory(category) : await getAllItems()
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const item = await createItem({
    name: body.name,
    category: body.category as Category,
    unit: body.unit as Unit,
    startingValue: body.startingValue ?? 0,
  })
  return NextResponse.json(item, { status: 201 })
}
