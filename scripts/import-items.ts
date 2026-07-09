import mongoose from 'mongoose'
import fs from 'fs'
import { parseCSV } from '../lib/csv'

function findColumn(header: string[], keywords: string[]): number {
  return header.findIndex((h) => keywords.some((k) => h.toLowerCase().includes(k)))
}

function toNumberOrNull(raw?: string): number | null {
  const trimmed = raw?.trim().replace(/[$,]/g, '')
  if (!trimmed) return null
  const n = parseFloat(trimmed)
  return isNaN(n) ? null : n
}

async function importItems() {
  const uri = process.env.MONGODB_URI
  if (!uri) { console.error('Set MONGODB_URI in .env.local'); process.exit(1) }

  const [, , filePath] = process.argv
  if (!filePath) {
    console.error('Usage: npx tsx scripts/import-items.ts <path-to-csv>')
    process.exit(1)
  }

  const text = fs.readFileSync(filePath, 'utf-8')
  const table = parseCSV(text)
  if (table.length < 2) {
    console.error('CSV has no data rows.')
    process.exit(1)
  }

  const header = table[0]
  const nameIdx = findColumn(header, ['description', 'product', 'name', 'item'])
  const packIdx = findColumn(header, ['pack', 'unit', 'box'])
  const priceIdx = findColumn(header, ['price', 'cost'])

  if (nameIdx === -1) {
    console.error(`Could not find a name/description column. Header row was: ${header.join(', ')}`)
    process.exit(1)
  }

  console.log(`Using columns — Name: "${header[nameIdx]}", Units/Pack: "${header[packIdx] ?? '(none found)'}", Price: "${header[priceIdx] ?? '(none found)'}"`)

  await mongoose.connect(uri)
  const { default: Item } = await import('../lib/models/Item')

  let created = 0
  const skipped: string[] = []

  for (const row of table.slice(1)) {
    const name = row[nameIdx]?.trim()
    if (!name) continue

    const existing = await Item.findOne({
      category: 'dry',
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    })
    if (existing) {
      skipped.push(name)
      continue
    }

    await Item.create({
      name,
      category: 'dry',
      unit: 'count',
      currentCount: 0,
      unitsPerBox: packIdx !== -1 ? toNumberOrNull(row[packIdx]) : null,
      boxPrice: priceIdx !== -1 ? toNumberOrNull(row[priceIdx]) : null,
      minStock: null,
    })
    created++
  }

  console.log(`Created ${created} item(s).`)
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} already-existing item(s): ${skipped.join(', ')}`)
  }

  await mongoose.disconnect()
}

importItems().catch((e) => { console.error(e); process.exit(1) })
