export const DRY_SIZES = [1, 2, 4, 5, 8, 12, 16, 20, 24, 32, 64] as const

export function detectSizes(name: string): number[] {
  const found = new Set<number>()
  const regex = /(\d+)\s*oz/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(name))) {
    const n = parseInt(match[1], 10)
    if ((DRY_SIZES as readonly number[]).includes(n)) found.add(n)
  }
  return Array.from(found)
}

export type DryMaterial = 'Foam' | 'Transparent/Plastic' | 'Aluminum' | 'Paper'

export const DRY_MATERIALS: DryMaterial[] = ['Foam', 'Transparent/Plastic', 'Aluminum', 'Paper']

export function detectMaterial(name: string): DryMaterial | null {
  const n = name.toLowerCase()
  if (n.includes('foam')) return 'Foam'
  if (n.includes('aluminio') || n.includes('aluminum')) return 'Aluminum'
  if (n.includes('papel') || n.includes('paper') || n.includes('napkin') || n.includes('servilleta')) return 'Paper'
  if (n.includes('transparent') || n.includes('plastic') || n.includes('plastico')) return 'Transparent/Plastic'
  return null
}

export type DryType =
  | 'Cups' | 'Lids' | 'Containers & Trays' | 'Bags' | 'Cutlery & Straws'
  | 'Paper & Napkins' | 'Cleaning Supplies' | 'Gloves & Safety' | 'Printer & Office' | 'Other'

export const DRY_TYPES: DryType[] = [
  'Cups', 'Lids', 'Containers & Trays', 'Bags', 'Cutlery & Straws',
  'Paper & Napkins', 'Cleaning Supplies', 'Gloves & Safety', 'Printer & Office', 'Other',
]

// "Lids" is checked last, as a fallback: names like "Contenedor 32oz con tapa" mention a lid
// as a feature of a container, while a genuine lid product has no other head-noun match at all.
const TYPE_KEYWORDS: [Exclude<DryType, 'Lids' | 'Other'>, string[]][] = [
  ['Cups', ['vaso', 'cup holder']],
  ['Containers & Trays', ['contenedor', 'plato', 'charola', 'combo']],
  ['Bags', ['bolsa', 'bag ']],
  ['Cutlery & Straws', ['cuchara', 'tenedor', 'popote', 'cubiertos']],
  ['Paper & Napkins', ['servilleta', 'napkin', 'papel higienico', 'multifold', 'bond papel', 'wax paper', 'papel bond', 'papel encerado']],
  ['Cleaning Supplies', ['cloro', 'acido', 'jabon', 'windex', 'grill oven cleaner']],
  ['Gloves & Safety', ['guante']],
  ['Printer & Office', ['cinta', 'tinta', 'thermal', 'rollo impresora', 'sticker']],
]

export function detectType(name: string): DryType {
  const n = name.toLowerCase().trim()
  if (n.startsWith('tapa')) return 'Lids'
  for (const [type, keywords] of TYPE_KEYWORDS) {
    if (keywords.some((k) => n.includes(k))) return type
  }
  if (n.includes('tapa')) return 'Lids'
  return 'Other'
}
