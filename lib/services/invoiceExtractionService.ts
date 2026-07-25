import { anthropic } from '@/lib/anthropic'
import type Anthropic from '@anthropic-ai/sdk'
import type { InvoiceExtractionResult, InvoiceLineItem } from '@/types'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5'

const TOOL_NAME = 'record_invoice_line_items'

const SYSTEM_PROMPT = `You read restaurant delivery invoices (photos or PDFs) and extract line items to match against an existing inventory catalog. You do NOT do any case-to-unit conversion math yourself — you only report exactly what's printed on the invoice, and the app computes the final stock quantity afterward using the catalog's own case-size data for the matched item.

For every line item on the invoice:
- Report the raw text as it appears and your best-read extracted name.
- Report \`invoiceQuantity\`: the plain number printed on the invoice for this line (e.g. if the invoice says "2 CS", invoiceQuantity is 2 — the raw number only, never a conversion of it).
- Report \`invoiceUnit\`: the unit exactly as printed (e.g. "case", "cs", "bottle", "bag", "each", "ctn"), or null if none is shown.
- Report \`isCaseQuantity\`: true if invoiceQuantity counts cases, boxes, cartons, or any other outer packaging that needs converting into the catalog's tracked unit — false if invoiceQuantity is already counting individual units the same way the catalog tracks that item (e.g. the invoice already lists a bottle count, or a bag count that matches how the catalog tracks that item). Invoices abbreviate this in many ways — "CS", "CTN", "BX", "case", "box", "/CS" after the item, or a quantity column literally labeled "Cases" or "Units Ordered" (as opposed to "Each") all mean isCaseQuantity is true. When in doubt about whether a number is a case count or an individual-unit count, look at the scale: a small number (1-10) next to a big, generic product name on a wholesale invoice is almost always a case count, not a literal handful of items.
- Report \`invoicePackSize\`: if the invoice's own item description states how many individual units are packed in one case/box (e.g. "TOPO CHICO 12PK" → 12, "LIDS 6BG/CS" → 6, "24/CS", "CASE OF 4", "5LB WHEEL 2/CASE" → 2), report that number here. Otherwise null. Report this whenever the invoice states it — including for items with no catalog match at all, since a brand-new item has no catalog case size to fall back on and the invoice's own stated pack size is the only conversion data available. Read it directly from the invoice text; do not compute or guess it.
- Match the line against the provided catalog using your judgment — vendor naming is often abbreviated, reordered, or in a different language than the catalog (e.g. "Bud Light 24pk Can" should match a catalog item literally named "Budlight"). Only report a match you're actually confident in; if nothing in the catalog is a plausible match, set matchedItemId and matchedItemName to null.
- Give a confidence score from 0 to 1 reflecting how sure you are about the match (not about having read the line correctly).
- Give a short one-sentence reasoning for the match (or lack of one) so a human reviewer can sanity-check it.

Do not do the case-to-unit multiplication yourself — just report the raw numbers (invoiceQuantity, invoicePackSize) and let the app do the math. The app prefers the catalog's own case size when one is on file, and only falls back to your invoicePackSize reading when the catalog has none — so report invoicePackSize whenever the invoice states it, even for items you're confident already have a case size saved, since it costs nothing and helps if the catalog turns out to be missing it.

Report every line item you can find, even ones you can't match. Do not skip line items just because you're unsure of the match.`

const tool: Anthropic.Tool = {
  name: TOOL_NAME,
  description:
    'Record every line item found on this invoice, matched against the provided item catalog. ' +
    'Report invoiceQuantity, invoiceUnit, and invoicePackSize exactly as printed on the invoice — do not convert case ' +
    'quantities yourself; the app converts them afterward, preferring the catalog\'s own unitsPerBox for the matched ' +
    'item and falling back to invoicePackSize only when the catalog has no case size on file.',
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      vendorGuess: { type: ['string', 'null'] },
      lineItems: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            rawText: { type: 'string' },
            extractedName: { type: 'string' },
            invoiceQuantity: { type: 'number' },
            invoiceUnit: { type: ['string', 'null'] },
            isCaseQuantity: { type: 'boolean' },
            invoicePackSize: { type: ['number', 'null'] },
            matchedItemId: { type: ['string', 'null'] },
            matchedItemName: { type: ['string', 'null'] },
            confidence: { type: 'number' },
            reasoning: { type: 'string' },
          },
          required: [
            'rawText', 'extractedName', 'invoiceQuantity', 'invoiceUnit', 'isCaseQuantity', 'invoicePackSize',
            'matchedItemId', 'matchedItemName', 'confidence', 'reasoning',
          ],
          additionalProperties: false,
        },
      },
    },
    required: ['vendorGuess', 'lineItems'],
    additionalProperties: false,
  },
}

interface RawLineItem {
  rawText: string
  extractedName: string
  invoiceQuantity: number
  invoiceUnit: string | null
  isCaseQuantity: boolean
  invoicePackSize: number | null
  matchedItemId: string | null
  matchedItemName: string | null
  confidence: number
  reasoning: string
}

export type InvoiceExtractionErrorCode = 'refusal' | 'malformed' | 'truncated' | 'upstream'

export class InvoiceExtractionError extends Error {
  code: InvoiceExtractionErrorCode
  constructor(message: string, code: InvoiceExtractionErrorCode) {
    super(message)
    this.name = 'InvoiceExtractionError'
    this.code = code
  }
}

export interface CatalogRow {
  _id: string
  name: string
  category: string
  subcategory?: string | null
  unit: string
  unitsPerBox: number | null
}

function serializeCatalogForPrompt(items: CatalogRow[]): string {
  return items
    .map((i) => [i._id, i.name, i.category, i.subcategory ?? '', i.unit, i.unitsPerBox ?? ''].join('\t'))
    .join('\n')
}

export async function extractInvoiceLineItems(args: {
  file: Blob
  filename: string
  vendorHint?: string
  catalog: CatalogRow[]
}): Promise<InvoiceExtractionResult> {
  const bytes = Buffer.from(await args.file.arrayBuffer())
  const base64 = bytes.toString('base64')
  const mediaType = args.file.type || 'image/jpeg'
  const isPdf = mediaType === 'application/pdf'

  const fileBlock: Anthropic.ImageBlockParam | Anthropic.DocumentBlockParam = isPdf
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
    : {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: base64,
        },
      }

  const catalogTsv = serializeCatalogForPrompt(args.catalog)

  let response: Anthropic.Message
  try {
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' },
      tools: [tool],
      tool_choice: { type: 'tool', name: TOOL_NAME },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            fileBlock,
            {
              type: 'text',
              text:
                `Item catalog (id\tname\tcategory\tsubcategory\tunit\tunitsPerBox), one per line:\n\n${catalogTsv}` +
                (args.vendorHint ? `\n\nThe user says this invoice is from: ${args.vendorHint}` : ''),
              cache_control: { type: 'ephemeral' },
            },
          ],
        },
      ],
    })
    response = await stream.finalMessage()
  } catch (err) {
    throw new InvoiceExtractionError(
      err instanceof Error ? err.message : 'Failed to reach the invoice reader.',
      'upstream'
    )
  }

  if (response.stop_reason === 'refusal') {
    throw new InvoiceExtractionError('The model declined to process this file.', 'refusal')
  }

  if (response.stop_reason === 'max_tokens') {
    throw new InvoiceExtractionError(
      'This invoice has too many line items to process in one pass — try splitting it into two uploads.',
      'truncated'
    )
  }

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === TOOL_NAME
  )
  if (!toolUse) {
    throw new InvoiceExtractionError('Could not read structured data from this invoice.', 'malformed')
  }

  const parsed = toolUse.input as { vendorGuess: string | null; lineItems: RawLineItem[] }
  const catalogById = new Map(args.catalog.map((c) => [c._id, c]))

  const lineItems: InvoiceLineItem[] = parsed.lineItems.map((line) => {
    const rawId = line.matchedItemId?.trim() || null
    const item = rawId ? catalogById.get(rawId) : undefined

    // Not a case quantity — the invoice already counts in the catalog's own unit, use as-is.
    if (!line.isCaseQuantity) {
      return {
        rawText: line.rawText,
        extractedName: line.extractedName,
        quantity: line.invoiceQuantity,
        unit: line.invoiceUnit,
        matchedItemId: line.matchedItemId,
        matchedItemName: line.matchedItemName,
        confidence: line.confidence,
        reasoning: `${line.reasoning} [read as ${line.invoiceQuantity} ${line.invoiceUnit ?? 'unit(s)'}, not a case quantity — used as-is]`,
      }
    }

    // Case quantity, and we have a resolved item with a case size on file — the catalog
    // is the source of truth, since it's what you've actually verified, and vendors don't
    // always print the pack size accurately (or at all).
    if (item?.unitsPerBox) {
      const quantity = line.invoiceQuantity * item.unitsPerBox
      return {
        rawText: line.rawText,
        extractedName: line.extractedName,
        quantity,
        unit: line.invoiceUnit,
        matchedItemId: line.matchedItemId,
        matchedItemName: line.matchedItemName,
        confidence: line.confidence,
        reasoning: `${line.reasoning} (${line.invoiceQuantity} ${line.invoiceUnit ?? 'case'} × ${item.unitsPerBox}/case on file = ${quantity})`,
      }
    }

    // No case size on file for this item — either it's a matched item whose catalog
    // entry is missing unitsPerBox, or (just as often) there's no match at all because
    // the item doesn't exist in the catalog yet, so there's no catalog data to fall back
    // on in the first place. Either way, use whatever pack size the invoice itself states.
    // Lower confidence since this wasn't verified against your own records, but at least
    // compute a real number instead of leaving a raw case count to convert by hand.
    if (line.invoicePackSize) {
      const quantity = line.invoiceQuantity * line.invoicePackSize
      return {
        rawText: line.rawText,
        extractedName: line.extractedName,
        quantity,
        unit: line.invoiceUnit,
        matchedItemId: line.matchedItemId,
        matchedItemName: line.matchedItemName,
        confidence: Math.min(line.confidence, 0.75),
        reasoning: item
          ? `${line.reasoning} (${line.invoiceQuantity} ${line.invoiceUnit ?? 'case'} × ${line.invoicePackSize}/case from the invoice, since none is on file — verify, and consider saving ${line.invoicePackSize} to this item's Units/Box so future imports don't need to guess = ${quantity})`
          : `${line.reasoning} (${line.invoiceQuantity} ${line.invoiceUnit ?? 'case'} × ${line.invoicePackSize}/case from the invoice = ${quantity} — this is a new item, so there's no catalog case size to check against; verify before creating it)`,
      }
    }

    // No catalog case size, no pack size stated on the invoice either — genuinely can't
    // convert. Fall back to the raw case count and force the row into review rather than
    // silently writing a case count as if it were the unit count.
    return {
      rawText: line.rawText,
      extractedName: line.extractedName,
      quantity: line.invoiceQuantity,
      unit: line.invoiceUnit,
      matchedItemId: line.matchedItemId,
      matchedItemName: line.matchedItemName,
      confidence: Math.min(line.confidence, 0.5),
      reasoning: item
        ? `${line.reasoning} — no case size on file for this item and none printed on the invoice, so ${line.invoiceQuantity} may be a case count, not the actual quantity. Please verify.`
        : `${line.reasoning} — no case size printed on the invoice either, so ${line.invoiceQuantity} may be a case count, not the actual quantity. Please verify.`,
    }
  })

  return { vendorGuess: parsed.vendorGuess, fileName: args.filename, lineItems }
}
