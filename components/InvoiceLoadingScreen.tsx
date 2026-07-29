'use client'
import { useEffect, useState } from 'react'

const STAGES = [
  { label: 'Uploading your invoice', short: 'Upload', duration: 1200 },
  { label: 'Reading the invoice', short: 'Read', duration: 6000 },
  { label: 'Matching items to your inventory', short: 'Match', duration: 8000 },
  { label: 'Double-checking uncertain matches', short: 'Verify', duration: null },
]

const DOT_PATTERN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='9' fill='none' stroke='rgba(255,255,255,0.35)' stroke-width='1.5'/></svg>"
  )

function CornerDots({ className }: { className: string }) {
  return (
    <div
      className={`absolute w-[480px] h-[480px] pointer-events-none animate-drift ${className}`}
      style={{
        backgroundImage: `url("${DOT_PATTERN}")`,
        maskImage: 'radial-gradient(circle, black 35%, transparent 72%)',
        WebkitMaskImage: 'radial-gradient(circle, black 35%, transparent 72%)',
      }}
    />
  )
}

function FlowingLines() {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 600" fill="none">
      <path
        d="M-50,120 C150,120 150,20 350,20 S 600,220 850,220 S 1050,60 1150,60"
        stroke="#40916C"
        strokeOpacity="0.55"
        strokeWidth="2.5"
        strokeDasharray="14 12"
        className="animate-flow-line"
      />
      <path
        d="M-50,520 C200,520 200,440 420,440 S 680,560 900,560 S 1050,480 1150,480"
        stroke="#95D5B2"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeDasharray="10 10"
        className="animate-flow-line"
        style={{ animationDuration: '16s', animationDirection: 'reverse' }}
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

interface Props {
  fileName: string
}

export default function InvoiceLoadingScreen({ fileName }: Props) {
  const [stageIndex, setStageIndex] = useState(0)
  const [overtime, setOvertime] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    let elapsed = 0
    STAGES.forEach((stage, i) => {
      if (stage.duration == null) return
      elapsed += stage.duration
      timers.push(setTimeout(() => setStageIndex(i + 1), elapsed))
    })
    timers.push(setTimeout(() => setOvertime(true), elapsed + 10000))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-700 overflow-hidden animate-backdrop-in">
      {/* Decorative background pattern, in the style of a branded auth/loading screen */}
      <CornerDots className="-top-32 -left-32" />
      <CornerDots className="-bottom-32 -right-32" />
      <FlowingLines />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" className="absolute top-6 left-6 w-9 h-9 rounded-lg object-contain bg-white/90 shadow-sm" />

      {/* Card */}
      <div className="relative w-full max-w-xs mx-4 bg-white shadow-2xl overflow-hidden animate-fade-in">
        <div className="px-6 py-7 flex flex-col items-center gap-1">
          <p className="text-sm font-semibold text-gray-800 text-center">
            {STAGES[Math.min(stageIndex, STAGES.length - 1)].label}
          </p>
          <p className="text-xs text-gray-400 mb-6 truncate max-w-full">{fileName}</p>

          {/* Horizontal step tracker: fills left-to-right as each stage completes */}
          <div className="w-full flex items-center">
            {STAGES.map((stage, i) => {
              const done = i < stageIndex
              const active = i === stageIndex
              const isLast = i === STAGES.length - 1
              return (
                <div key={stage.label} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300 ${
                        done ? 'bg-forest text-white' : active ? 'border-2 border-forest-100 border-t-forest animate-spin' : 'border-2 border-gray-200'
                      }`}
                    >
                      {done && <CheckIcon />}
                    </span>
                    <span
                      className={`text-[10px] leading-none whitespace-nowrap transition-colors duration-300 ${
                        active ? 'text-gray-800 font-semibold' : done ? 'text-gray-500' : 'text-gray-300'
                      }`}
                    >
                      {stage.short}
                    </span>
                  </div>
                  {!isLast && (
                    <div className="relative flex-1 h-0.5 bg-gray-200 mx-1.5 -translate-y-2.5">
                      <div
                        className={`absolute inset-y-0 left-0 bg-forest-500 transition-all duration-700 ease-out ${done ? 'w-full' : 'w-0'}`}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {overtime && (
            <p className="text-xs text-gray-400 text-center mt-5 animate-fade-in">
              Larger or busier invoices can take a little longer — hang tight…
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
