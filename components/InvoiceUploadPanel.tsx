'use client'
import { useRef, useState } from 'react'
import { useToast } from '@/context/ToastContext'
import InvoiceLoadingScreen from './InvoiceLoadingScreen'
import type { InvoiceExtractionResult } from '@/types'

const MAX_FILE_BYTES = 15 * 1024 * 1024
const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp'

interface Props {
  onExtracted: (result: InvoiceExtractionResult) => void
}

export default function InvoiceUploadPanel({ onExtracted }: Props) {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [vendorHint, setVendorHint] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handlePickClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return

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
    <div className="max-w-lg mx-auto flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-forest mb-1">Import Invoice</h1>
        <p className="text-sm text-gray-500">
          Upload a delivery invoice — a photo or a PDF — and we&apos;ll read the line items and match them to your inventory.
        </p>
      </div>

      <input ref={fileInputRef} type="file" accept={ACCEPT} onChange={handleFileChange} className="hidden" />

      <button
        onClick={handlePickClick}
        className="border-2 border-dashed border-gray-200 rounded-2xl py-10 flex flex-col items-center gap-2 text-gray-400 hover:border-forest-500 hover:text-forest-500 transition-colors bg-white"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12" /><path d="M7 8l5-5 5 5" /><path d="M5 21h14" />
        </svg>
        <span className="text-sm font-medium">{file ? file.name : 'Tap to choose a photo or PDF'}</span>
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
        className="bg-forest hover:bg-forest-600 text-white rounded-xl py-3.5 text-base font-semibold disabled:opacity-40 transition active:scale-[0.98]"
      >
        Read Invoice
      </button>
    </div>
  )
}
