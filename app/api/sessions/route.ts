import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createUpdateSession } from '@/lib/services/sessionService'

export async function POST(request: NextRequest) {
  const authSession = await getServerSession(authOptions)
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  if (!body.direction || !body.note || !Array.isArray(body.changes)) {
    return NextResponse.json({ error: 'direction, note, and changes are required' }, { status: 400 })
  }

  if (body.changes.length === 0) {
    return NextResponse.json({ error: 'No changes to submit' }, { status: 400 })
  }

  const session = await createUpdateSession({
    userId: (authSession.user as { id?: string }).id ?? '',
    displayName: authSession.user?.name ?? 'Unknown',
    direction: body.direction,
    note: body.note,
    changes: body.changes,
  })

  return NextResponse.json(session, { status: 201 })
}
