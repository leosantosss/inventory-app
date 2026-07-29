import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllItems } from '@/lib/services/itemService'
import { extractInvoiceLineItems, InvoiceExtractionError } from '@/lib/services/invoiceExtractionService'

export const maxDuration = 300

const MAX_FILE_BYTES = 15 * 1024 * 1024
const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])

const ERROR_STATUS: Record<string, number> = {
  refusal: 502,
  malformed: 502,
  truncated: 502,
  upstream: 502,
}

export async function POST(request: NextRequest) {
  const authSession = await getServerSession(authOptions)
  if (!authSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'A file is required' }, { status: 400 })
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'File is too large — must be under 15MB' }, { status: 413 })
  }

  const vendorHintRaw = form.get('vendorHint')
  const vendorHint = typeof vendorHintRaw === 'string' && vendorHintRaw.trim() ? vendorHintRaw.trim() : undefined
  const filename = file instanceof File ? file.name : 'invoice'
  const isTsv = /\.tsv$/i.test(filename) || file.type === 'text/tab-separated-values'

  if (!ALLOWED_TYPES.has(file.type) && !isTsv) {
    return NextResponse.json({ error: 'Unsupported file type — use a JPEG/PNG/WebP photo, a PDF, or a TSV file' }, { status: 415 })
  }

  try {
    const items = await getAllItems()
    const result = await extractInvoiceLineItems({
      file,
      filename,
      vendorHint,
      catalog: items.map((i) => ({
        _id: String(i._id),
        name: i.name,
        category: i.category,
        subcategory: i.subcategory,
        unit: i.unit,
        unitsPerBox: i.unitsPerBox,
      })),
    })
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof InvoiceExtractionError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: ERROR_STATUS[err.code] ?? 502 })
    }
    return NextResponse.json({ error: 'Could not process this invoice — try again.' }, { status: 500 })
  }
}
