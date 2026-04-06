import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { ErrorMessage } from '../components/ErrorMessage'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.roles.includes('Admin')) navigate('/admin', { replace: true })
      else navigate('/impact', { replace: true })
    } catch {
      setError('Login failed. Please check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
        <div className="w-full rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-center">
            <div className="text-xl font-bold text-slate-900">Nova Path</div>
            <div className="mt-1 text-sm text-slate-600">Staff sign in</div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="mt-1 w-full rounded-md border px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="mt-1 w-full rounded-md border px-3 py-2 text-slate-900 outline-none focus:border-slate-400"
              />
            </div>

            {error && <ErrorMessage message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

