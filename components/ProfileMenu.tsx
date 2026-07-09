'use client'
import { useState, FormEvent } from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function ProfileMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'menu' | 'password'>('menu')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  function handleOpen() {
    setOpen(true)
    setView('menu')
    setError('')
    setSuccess('')
  }

  function handleClose() {
    setOpen(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirm('')
    setError('')
    setSuccess('')
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (newPassword !== confirm) {
      setError('New passwords do not match')
      return
    }
    setSaving(true)
    const res = await fetch('/api/user/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(data.error)
    } else {
      setSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-base font-bold transition-colors"
        aria-label="Profile"
      >
        {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-backdrop-in" onClick={handleClose}>
          <div className="bg-white w-full rounded-t-3xl animate-sheet-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3" />

            {view === 'menu' && (
              <div className="p-6 flex flex-col gap-1">
                <div className="flex items-center gap-4 pb-4 mb-2 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-forest text-white flex items-center justify-center text-xl font-bold">
                    {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-base">{session?.user?.name}</p>
                    <p className="text-sm text-gray-400">@{session?.user?.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => { setView('password'); setError(''); setSuccess('') }}
                  className="flex items-center gap-3 py-3.5 px-2 text-gray-700 hover:bg-gray-50 rounded-xl text-left transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center text-forest text-base">🔑</span>
                  <span className="text-base font-medium">Change Password</span>
                </button>

                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-3 py-3.5 px-2 text-crimson hover:bg-crimson-50 rounded-xl text-left transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-crimson-50 flex items-center justify-center text-base">🚪</span>
                  <span className="text-base font-medium">Log Out</span>
                </button>

                <div className="pb-2" />
              </div>
            )}

            {view === 'password' && (
              <div className="p-6 pb-8">
                <div className="flex items-center gap-3 mb-5">
                  <button onClick={() => setView('menu')} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                    ‹
                  </button>
                  <h2 className="font-display text-xl font-bold text-forest">Change Password</h2>
                </div>
                <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                  {error && <p className="text-crimson text-sm font-medium bg-crimson-50 px-3 py-2 rounded-lg">{error}</p>}
                  {success && <p className="text-forest text-sm font-medium bg-forest-50 px-3 py-2 rounded-lg">{success}</p>}
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-forest hover:bg-forest-600 text-white rounded-xl py-3.5 text-base font-semibold disabled:opacity-40 transition active:scale-[0.98] mt-1"
                  >
                    {saving ? 'Saving…' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}
