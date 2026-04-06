import { NavBar } from '../../components/NavBar'

export function ReportsPage() {
  return (
    <div className="min-h-full bg-brand-50 text-surface-dark">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-surface-dark">Reports</h1>
        <div className="mt-6 rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
          <div className="text-sm text-surface-text">
            Donation trends, resident outcomes, safehouse performance, and reintegration charts will be wired to analytics endpoints next.
          </div>
        </div>
      </main>
    </div>
  )
}

