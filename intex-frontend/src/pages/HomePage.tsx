import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

type PublicStats = {
  totalGirlsServed: number
  activeSafehouses: number
  reintegrationRate: number
  totalDonors: number
}

export function HomePage() {
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get<PublicStats>('/api/public/stats')
        if (!cancelled) setStats(res.data)
      } catch {
        if (!cancelled) setError('Unable to load impact stats right now.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-full bg-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white md:p-12">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Nova Path</h1>
          <p className="mt-3 max-w-2xl text-slate-100">
            Trauma-informed rehabilitation and long-term support for survivors of sexual abuse and
            sex trafficking in Brazil.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/impact"
              className="rounded-md bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-100"
            >
              See Our Impact
            </Link>
            <Link
              to="/login"
              className="rounded-md border border-white/30 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/15"
            >
              Staff Login
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Impact at a glance</h2>
          {error ? (
            <div className="mt-4">
              <ErrorMessage message={error} />
            </div>
          ) : !stats ? (
            <LoadingSpinner />
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-2xl font-semibold text-slate-900">{stats.totalGirlsServed}</div>
                <div className="text-sm text-slate-600">Girls served</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-2xl font-semibold text-slate-900">{stats.activeSafehouses}</div>
                <div className="text-sm text-slate-600">Active safehouses</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-2xl font-semibold text-slate-900">
                  {Math.round(stats.reintegrationRate * 100)}%
                </div>
                <div className="text-sm text-slate-600">Reintegration rate</div>
              </div>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Our mission</h2>
            <p className="mt-2 text-slate-700">
              Nova Path supports survivors with safe housing, counseling, education planning, and
              reintegration services—always prioritizing privacy, dignity, and long-term stability.
            </p>
            <p className="mt-3 text-slate-700">
              This platform helps staff coordinate services and helps donors understand outcomes
              through anonymized, aggregate impact reporting.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <div className="flex h-full min-h-48 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              Placeholder image
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-slate-600">
          <div>© {new Date().getFullYear()} Nova Path</div>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-slate-900">
              Home
            </Link>
            <Link to="/privacy" className="hover:text-slate-900">
              Privacy Policy
            </Link>
            <a href="mailto:contact@novapath.org" className="hover:text-slate-900">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

