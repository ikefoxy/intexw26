import { NavBar } from '../../components/NavBar'

export function NewResidentPage() {
  return (
    <div className="min-h-full bg-slate-50">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">New Resident</h1>
        <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-600">
            Form will post to `POST /api/residents` next.
          </div>
        </div>
      </main>
    </div>
  )
}

