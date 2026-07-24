'use client'
import { useState, useRef, useEffect } from 'react'

interface Option<T extends string | number> {
  value: T
  label: string
}

interface Props<T extends string | number> {
  label: string
  options: Option<T>[]
  selected: T | null
  onChange: (value: T | null) => void
}

export default function FilterDropdown<T extends string | number>({ label, options, selected, onChange }: Props<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedOption = options.find((o) => o.value === selected)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap transition-colors ${
          selectedOption
            ? 'bg-forest text-white border-forest'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
        }`}
      >
        {selectedOption ? `${label}: ${selectedOption.label}` : label}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 min-w-[10rem] max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1">
          <button
            onClick={() => { onChange(null); setOpen(false) }}
            className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
              selected === null ? 'text-forest font-semibold bg-forest-50' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(selected === o.value ? null : o.value); setOpen(false) }}
              className={`w-full text-left px-3.5 py-2 text-sm whitespace-nowrap transition-colors ${
                selected === o.value ? 'text-forest font-semibold bg-forest-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
