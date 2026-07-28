'use client'
import { useRef, useState } from 'react'
import { useToast } from '@/context/ToastContext'
import InvoiceLoadingScreen from './InvoiceLoadingScreen'
import type { InvoiceExtractionResult } from '@/types'

const MAX_FILE_BYTES = 15 * 1024 * 1024
const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp'

const STEPS = [
  { title: 'Upload', desc: 'Snap a photo or attach a PDF of the delivery invoice.' },
  { title: 'AI reads it', desc: "We extract every line item and match it to your inventory automatically." },
  { title: 'Review & apply', desc: 'Confirm any flagged matches, then apply to update stock and pricing.' },
]

interface Props {
  onExtracted: (result: InvoiceExtractionResult) => void
}

export default function InvoiceUploadPanel({ onExtracted }: Props) {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [vendorHint, setVendorHint] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dragging, setDragging] = useState(false)

  function handlePickClick() {
    fileInputRef.current?.click()
  }

  function processFile(picked: File) {
    if (picked.type === 'image/heic' || picked.type === 'image/heif' || /\.heic$|\.heif$/i.test(picked.name)) {
      showToast('HEIC photos aren’t supported yet — try "Save as JPEG" or share via a Files app export.', 'error')
      return
    }
    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(picked.type)) {
      showToast('Please use a JPEG, PNG, or WebP photo, or a PDF.', 'error')
      return
    }
    if (picked.size > MAX_FILE_BYTES) {
      showToast('That file is too large — must be under 15MB.', 'error')
      return
    }
    setFile(picked)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return
    processFile(picked)
  }

  function handleDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) processFile(dropped)
  }

  async function handleSubmit() {
    if (!file) return
    setSubmitting(true)
    try {
      const form = new FormData()
      form.append('file', file)
      if (vendorHint.trim()) form.append('vendorHint', vendorHint.trim())

      const res = await fetch('/api/invoices/extract', { method: 'POST', body: form })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Could not read this invoice.')
      }
      const result: InvoiceExtractionResult = await res.json()
      onExtracted(result)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not read this invoice — try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitting) {
    return <InvoiceLoadingScreen fileName={file?.name ?? 'your invoice'} />
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-forest mb-1">Import Invoice</h1>
        <p className="text-sm text-gray-500 max-w-2xl">
          Upload a delivery invoice — a photo or a PDF — and we&apos;ll read the line items and match them to your inventory.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-5">
          <input ref={fileInputRef} type="file" accept={ACCEPT} onChange={handleFileChange} className="hidden" />

          <button
            onClick={handlePickClick}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl py-16 flex flex-col items-center gap-2 transition-colors ${
              dragging ? 'border-forest-500 bg-forest-50 text-forest-600' : 'border-gray-200 text-gray-400 hover:border-forest-500 hover:text-forest-500'
            }`}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" /><path d="M7 8l5-5 5 5" /><path d="M5 21h14" />
            </svg>
            <span className="text-sm font-medium">{file ? file.name : 'Drag & drop, or click to choose a photo or PDF'}</span>
            {file && <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span>}
          </button>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-500">Vendor (optional)</span>
            <input
              value={vendorHint}
              onChange={(e) => setVendorHint(e.target.value)}
              placeholder="e.g. Sysco, local beer distributor"
              className="border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
            />
          </label>

          <button
            onClick={handleSubmit}
            disabled={!file}
            className="self-end px-8 bg-forest hover:bg-forest-600 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 transition active:scale-[0.98]"
          >
            Read Invoice
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-700">How it works</h2>
          <ol className="flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-forest-50 text-forest-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="pt-3 border-t border-gray-100 text-xs text-gray-400">
            Accepts JPEG, PNG, WebP, or PDF — up to 15MB.
          </p>
        </div>
      </div>
    </div>
  )
}
