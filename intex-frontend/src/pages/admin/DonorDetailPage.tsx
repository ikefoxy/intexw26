import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorMessage } from '../../components/ErrorMessage'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { NavBar } from '../../components/NavBar'
import {
  getDonationsForSupporter,
  getSupporterById,
  getSupporterSegment,
  type Donation,
  type DonorSegment,
  type SupporterDetail,
} from '../../lib/api'

const personaColors: Record<string, string> = {
  Champions: 'bg-green-100 text-green-800 border-green-300',
  'At-Risk Donors': 'bg-red-100 text-red-800 border-red-300',
  'New/Occasional Donors': 'bg-amber-100 text-amber-800 border-amber-300',
}

export function DonorDetailPage() {
  const { id } = useParams()
  const supporterId = Number(id)
  const [supporter, setSupporter] = useState<SupporterDetail | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [segment, setSegment] = useState<DonorSegment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const lifetimeGiving = useMemo(
    () => donations.reduce((sum, d) => sum + (Number(d.amount ?? d.estimatedValue ?? 0) || 0), 0),
    [donations]
  )

  useEffect(() => {
    let active = true
    if (!Number.isFinite(supporterId)) {
      setError('Invalid supporter id.')
      setLoading(false)
      return
    }

    ;(async () => {
      try {
        const [detail, seg] = await Promise.all([
          getSupporterById(supporterId),
          getSupporterSegment(supporterId),
        ])
        if (!active) return
        setSupporter(detail)
        setSegment(seg)

        if (Array.isArray(detail.donations) && detail.donations.length > 0) {
          const sorted = [...detail.donations].sort(
            (a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime()
          )
          setDonations(sorted)
        } else {
          const rows = await getDonationsForSupporter(supporterId)
          if (!active) return
          setDonations(rows)
        }
      } catch {
        if (!active) return
        setError('Unable to load supporter details.')
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [supporterId])

  return (
    <div className="min-h-full text-surface-dark">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Link to="/admin/donors" className="text-sm font-semibold text-surface-text hover:text-surface-dark">
          ← Back to donors
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-surface-dark">Donor Detail</h1>
        <div className="mt-2 text-sm text-surface-text">SupporterId: {id}</div>

        {error ? (
          <div className="mt-6">
            <ErrorMessage message={error} />
          </div>
        ) : loading ? (
          <div className="mt-6">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <section className="mt-6 rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-surface-text">Name</div>
                  <div className="mt-1 text-sm font-semibold text-surface-dark">{supporter?.displayName ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-surface-text">Type</div>
                  <div className="mt-1 text-sm text-surface-dark">{supporter?.supporterType ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-surface-text">Status</div>
                  <div className="mt-1 text-sm text-surface-dark">{supporter?.status ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-surface-text">Lifetime Giving</div>
                  <div className="mt-1 text-sm font-semibold text-surface-dark">${lifetimeGiving.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-surface-text">Email</div>
                  <div className="mt-1 text-sm text-surface-dark">{supporter?.email ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-surface-text">Phone</div>
                  <div className="mt-1 text-sm text-surface-dark">{supporter?.phone ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-surface-text">Region</div>
                  <div className="mt-1 text-sm text-surface-dark">
                    {supporter ? `${supporter.region}, ${supporter.country}` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-surface-text">First Donation</div>
                  <div className="mt-1 text-sm text-surface-dark">
                    {supporter?.firstDonationDate
                      ? new Date(supporter.firstDonationDate).toLocaleDateString()
                      : '—'}
                  </div>
                </div>
              </div>
            </section>

            {segment?.persona && (
              <section className="mt-6 rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-surface-dark">Donor Persona</h2>
                <p className="mt-1 text-sm text-surface-text">
                  ML-powered segment based on recency, frequency, and monetary value.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${personaColors[segment.persona] ?? 'bg-slate-100 text-slate-800 border-slate-300'}`}
                  >
                    {segment.persona}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-surface-text">Recency</div>
                    <div className="mt-1 text-lg font-semibold text-surface-dark">
                      {segment.recency ?? '—'} <span className="text-xs font-normal text-surface-text">days</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-surface-text">Frequency</div>
                    <div className="mt-1 text-lg font-semibold text-surface-dark">
                      {segment.frequency ?? '—'} <span className="text-xs font-normal text-surface-text">donations</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs uppercase tracking-wide text-surface-text">Monetary</div>
                    <div className="mt-1 text-lg font-semibold text-surface-dark">
                      ${(segment.monetary ?? 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="mt-6 rounded-2xl border border-brand-100 bg-surface p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-surface-dark">Donation History</h2>
              {donations.length === 0 ? (
                <p className="mt-3 text-sm text-surface-text">No donations recorded for this supporter.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-surface-text">
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Campaign</th>
                        <th className="px-3 py-2 font-medium">Amount</th>
                        <th className="px-3 py-2 font-medium">Recurring</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {donations.map((d) => (
                        <tr key={d.donationId}>
                          <td className="px-3 py-2 text-surface-text">
                            {new Date(d.donationDate).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-surface-dark">{d.campaignName || 'General Fund'}</td>
                          <td className="px-3 py-2 font-semibold text-surface-dark">
                            ${Number(d.amount ?? d.estimatedValue ?? 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-surface-text">{d.isRecurring ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
