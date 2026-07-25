'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import InvoiceUploadPanel from '@/components/InvoiceUploadPanel'
import InvoiceReviewTable from '@/components/InvoiceReviewTable'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { InvoiceExtractionResult } from '@/types'

type Step = 'upload' | 'review'

export default function ImportInvoicePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('upload')
  const [result, setResult] = useState<InvoiceExtractionResult | null>(null)

  useDocumentTitle('Import Invoice')

  function handleExtracted(res: InvoiceExtractionResult) {
    setResult(res)
    setStep('review')
  }

  function handleBack() {
    setResult(null)
    setStep('upload')
  }

  function handleApplied() {
    router.push('/inventory/history')
  }

  return (
    <div className="animate-fade-in">
      {step === 'upload' && <InvoiceUploadPanel onExtracted={handleExtracted} />}

      {step === 'review' && result && (
        <InvoiceReviewTable result={result} onBack={handleBack} onApplied={handleApplied} />
      )}
    </div>
  )
}
