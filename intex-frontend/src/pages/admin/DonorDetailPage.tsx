import { useParams } from 'react-router-dom'
import { NavBar } from '../../components/NavBar'

export function DonorDetailPage() {
  const { id } = useParams()
  return (
    <div className="min-h-full bg-slate-50">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Donor Detail</h1>
        <div className="mt-2 text-sm text-slate-600">SupporterId: {id}</div>
        <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-600">
            Detail + donation history will be wired to `GET /api/supporters/{id}` next.
          </div>
        </div>
      </main>
    </div>
  )
}

