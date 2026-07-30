'use client'
import { ResponsiveContainer, Sankey, Tooltip, Rectangle } from 'recharts'
import { CATEGORY_COLORS, type SankeyData } from '@/lib/inventoryFlowTypes'

const fullCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const legendItems = [
  { label: 'Cooler', color: CATEGORY_COLORS.cooler },
  { label: 'Bar', color: CATEGORY_COLORS.bar },
  { label: 'Dry Storage', color: CATEGORY_COLORS.dry },
]

interface NodePayload { name: string; color: string; depth: 0 | 1 | 2; value?: number }

const MAX_LABEL_LENGTH = 28
function truncateLabel(name: string) {
  return name.length > MAX_LABEL_LENGTH ? `${name.slice(0, MAX_LABEL_LENGTH - 1)}…` : name
}

function SankeyNodeShape(props: { x: number; y: number; width: number; height: number; payload: NodePayload }) {
  const { x, y, width, height, payload } = props
  // The rightmost tier (item/"Other" nodes) would overflow the container if labeled
  // to the right, so those labels flip to the left of their node instead.
  const labelOnLeft = payload.depth === 2
  return (
    <g>
      <Rectangle x={x} y={y} width={width} height={height} fill={payload.color} radius={2} />
      <text
        x={labelOnLeft ? x - 6 : x + width + 6}
        y={y + height / 2}
        textAnchor={labelOnLeft ? 'end' : 'start'}
        dominantBaseline="middle"
        fontSize={12}
        fill="#374151"
      >
        {truncateLabel(payload.name)}
      </text>
    </g>
  )
}

function SankeyTooltipContent({ active, payload }: { active?: boolean; payload?: { name?: string; value?: number }[] }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="text-gray-700 font-semibold">{entry.name?.replace(' - ', ' → ')}: {fullCurrency.format(entry.value ?? 0)}</p>
    </div>
  )
}

export default function InventoryValueSankey({ data }: { data: SankeyData }) {
  const hasData = data.nodes.length > 1

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-700">Inventory Value Breakdown</h2>
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          {legendItems.map((l) => (
            <span key={l.label} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
      {!hasData ? (
        <p className="text-sm text-gray-400 py-10 text-center">Add pricing to your items to see how value breaks down.</p>
      ) : (
        <ResponsiveContainer width="100%" height={420}>
          <Sankey
            data={data}
            nodePadding={20}
            nodeWidth={12}
            margin={{ top: 8, right: 120, left: 8, bottom: 8 }}
            link={{ stroke: '#d1d5db', strokeOpacity: 0.4 }}
            node={<SankeyNodeShape x={0} y={0} width={0} height={0} payload={{ name: '', color: '', depth: 0 }} />}
          >
            <Tooltip content={<SankeyTooltipContent />} />
          </Sankey>
        </ResponsiveContainer>
      )}
    </div>
  )
}
