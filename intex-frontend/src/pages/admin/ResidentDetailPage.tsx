import { Link, useParams } from 'react-router-dom'
import { NavBar } from '../../components/NavBar'

export function ResidentDetailPage() {
  const { id } = useParams()
  return (
    <div className="min-h-full bg-slate-50">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/admin/residents" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
          ← Back to caseload
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Resident Detail</h1>
        <div className="mt-2 text-sm text-slate-600">ResidentId: {id}</div>

        <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-600">
            Detail layout + tabs (Process Recordings / Home Visitations) will be wired to `GET /api/residents/{id}`.
          </div>
        </div>
      </main>
    </div>
  )
}

