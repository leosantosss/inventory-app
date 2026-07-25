'use client'
import { useEffect, useState } from 'react'

const STAGES = [
  { label: 'Uploading your invoice', duration: 1200 },
  { label: 'Reading the invoice', duration: 6000 },
  { label: 'Matching items to your inventory', duration: 8000 },
  { label: 'Double-checking uncertain matches', duration: null },
]

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M9 13h6" /><path d="M9 17h6" /><path d="M9 9h1" />
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
    <div className="max-w-sm mx-auto py-14 flex flex-col items-center animate-fade-in">
      <div className="relative w-20 h-20 mb-2 flex items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-forest-500/30 animate-pulse-ring" />
        <span className="absolute inset-0 rounded-full bg-forest-500/30 animate-pulse-ring [animation-delay:1s]" />
        <div className="relative w-16 h-16 rounded-2xl bg-white border border-forest-100 shadow-sm flex items-center justify-center overflow-hidden text-forest-500">
          <DocumentIcon />
          <span className="absolute left-0 right-0 h-6 bg-gradient-to-b from-transparent via-forest-500/40 to-transparent animate-scan-sweep" />
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-8 truncate max-w-full">{fileName}</p>

      <div className="w-full flex flex-col self-start pl-4">
        {STAGES.map((stage, i) => {
          const done = i < stageIndex
          const active = i === stageIndex
          const isLast = i === STAGES.length - 1
          return (
            <div key={stage.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    done ? 'bg-forest text-white' : active ? 'border-2 border-forest-100 border-t-forest' : 'border-2 border-gray-200'
                  } ${active ? 'animate-spin' : ''}`}
                >
                  {done && <CheckIcon />}
                </span>
                {!isLast && <span className={`w-px flex-1 my-1 transition-colors duration-500 ${done ? 'bg-forest-500' : 'bg-gray-200'}`} />}
              </div>
              <p
                className={`pb-6 text-sm transition-colors duration-300 ${
                  active ? 'text-gray-800 font-semibold' : done ? 'text-gray-500' : 'text-gray-300'
                }`}
              >
                {stage.label}
              </p>
            </div>
          )
        })}
      </div>

      {overtime && (
        <p className="text-xs text-gray-400 text-center mt-1 animate-fade-in">
          Larger or busier invoices can take a little longer — hang tight…
        </p>
      )}
    </div>
  )
}
