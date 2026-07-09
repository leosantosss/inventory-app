'use client'
import { createContext, useContext, useCallback, useState, ReactNode } from 'react'

type ToastVariant = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto max-w-sm px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-[toast-in_0.2s_ease-out] ${
              t.variant === 'success' ? 'bg-forest' : 'bg-crimson-700'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
