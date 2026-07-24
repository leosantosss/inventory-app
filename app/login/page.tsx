import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-forest flex items-center justify-center text-white font-bold text-xl mb-4 shadow-sm">
            C
          </div>
          <h1 className="font-display text-gray-900 text-3xl font-bold tracking-wide">
            INVENTORY
          </h1>
          <p className="text-gray-400 text-sm mt-1 tracking-widest uppercase">
            Chychos
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-8">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
