import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-forest px-6 py-12"
      style={{ background: 'linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-white text-4xl font-bold tracking-wide">
            INVENTORY
          </h1>
          <p className="text-forest-100 text-sm mt-1 tracking-widest uppercase">
            Restaurant Management
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl px-8 py-8">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
