'use client'
import { createContext, useContext, useCallback, useState, ReactNode } from 'react'

type ToastVariant = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
  leaving: boolean
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

let nextId = 1
const DISPLAY_MS = 3700
const EXIT_MS = 300

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, variant, leaving: false }])
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, EXIT_MS)
    }, DISPLAY_MS)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto max-w-sm px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
              t.leaving ? 'animate-[toast-out_0.3s_ease-in_forwards]' : 'animate-[toast-in_0.2s_ease-out]'
            } ${t.variant === 'success' ? 'bg-forest' : 'bg-crimson-700'}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
