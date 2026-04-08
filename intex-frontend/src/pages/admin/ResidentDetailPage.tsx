import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getResidentRecommendations, type ResidentMlRecommendations } from '../../lib/api'
import { NavBar } from '../../components/NavBar'

export function ResidentDetailPage() {
  const { id } = useParams()
  const residentId = Number(id)
  const [recommendations, setRecommendations] = useState<ResidentMlRecommendations | null>(null)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadRecommendations() {
      if (!Number.isFinite(residentId)) return
      setRecommendationsLoading(true)
      setRecommendationsError(null)

      try {
        const data = await getResidentRecommendations(residentId)
        if (!active) return
        setRecommendations(data)
      } catch {
        if (!active) return
        setRecommendationsError('Unable to load AI matches right now.')
      } finally {
        if (active) setRecommendationsLoading(false)
      }
    }

    void loadRecommendations()
    return () => {
      active = false
    }
  }, [residentId])

  return (
    <div className="min-h-full text-surface-dark">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Link to="/admin/residents" className="text-sm font-semibold text-surface-text hover:text-surface-dark">
          ← Back to caseload
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-surface-dark">Resident Detail</h1>
        <div className="mt-2 text-sm text-surface-text">ResidentId: {id}</div>

        <div className="mt-6 rounded-2xl border border-brand-125 bg-surface p-5 shadow-sm">
          <div className="text-sm text-surface-text">Resident workflow actions</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to={`/admin/process-recordings/${id}`}
              className="inline-flex items-center rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
            >
              Open Process Recordings
            </Link>
            <Link
              to={`/admin/visitations/${id}`}
              className="inline-flex items-center rounded-md border border-brand-125 px-3 py-2 text-xs font-semibold text-surface-dark hover:bg-brand-50"
            >
              Open Visitations
            </Link>
          </div>
        </div>

        <section className="mt-6 rounded-2xl bg-surface border border-slate-300 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-dark">AI-Assisted Peer Matches</h2>
          <p className="mt-1 text-sm text-surface-text">
            Suggested peer connections based on the latest recommendation model output.
          </p>
          {recommendations?.modelUsed && (
            <p className="mt-1 text-xs text-surface-text">Model: {recommendations.modelUsed}</p>
          )}

          {recommendationsLoading ? (
            <p className="mt-4 text-sm text-surface-text">Loading recommendations...</p>
          ) : recommendationsError ? (
            <p className="mt-4 text-sm text-red-500">{recommendationsError}</p>
          ) : recommendations === null ? (
            <p className="mt-4 text-sm text-surface-text">
              No recommendation data is available yet for this resident.
            </p>
          ) : recommendations.peerMatches.length === 0 ? (
            <p className="mt-4 text-sm text-surface-text">No peer matches were found for this resident.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {recommendations.peerMatches.map((match) => (
                <div
                  key={match.matchId}
                  className="rounded-lg border border-brand-125 bg-brand-50 px-3 py-2 text-sm text-surface-dark"
                >
                  <div className="font-medium">Resident #{match.matchId}</div>
                  <div className="text-xs text-surface-text mt-0.5">
                    Similarity: {match.similarityScore.toFixed(2)} · {match.matchReason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl bg-surface border border-slate-300 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-surface-dark">Intervention Recommendations</h2>
          <p className="mt-1 text-sm text-surface-text">
            Data-driven intervention themes based on similar resident trajectories in the database.
          </p>

          {recommendationsLoading ? (
            <p className="mt-4 text-sm text-surface-text">Loading intervention recommendations...</p>
          ) : recommendationsError ? (
            <p className="mt-4 text-sm text-red-500">{recommendationsError}</p>
          ) : recommendations === null ? (
            <p className="mt-4 text-sm text-surface-text">
              No intervention recommendation data is available yet for this resident.
            </p>
          ) : recommendations.suggestedInterventions.length === 0 ? (
            <p className="mt-4 text-sm text-surface-text">No intervention recommendations were found.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {recommendations.suggestedInterventions.map((intervention) => (
                <span
                  key={intervention}
                  className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-surface-dark"
                >
                  {intervention}
                </span>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

