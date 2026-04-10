import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { NavBar } from '../../components/NavBar'
import { api } from '../../lib/api'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { ErrorMessage } from '../../components/ErrorMessage'

/* ─── Types ─── */

type LabelDecimalSeries = { labels: string[]; values: number[] }
type LabelIntSeries = { labels: string[]; values: number[] }

type OlsCoefficient = {
  feature: string
  coef: number
  p_value: number
  significant: boolean
}

type FeatureImportance = {
  feature: string
  importance: number
}

type WhatIfScenario = {
  name: string
  description: string
  predicted_referrals: number
}

type ModelPerformance = {
  r2: number
  rmse: number
  mae: number
  cv_r2_mean: number
  cv_r2_std: number
  baseline_rmse: number
  baseline_mae: number
  improvement_over_baseline_pct: number
  train_rmse: number
  test_rmse: number
}

type TopRecommendations = {
  best_platform?: string
  best_platform_avg?: number
  best_post_type?: string
  best_hour?: number
  best_day?: string
  best_topic?: string
  cta_lift_pct?: number
  story_lift_pct?: number
}

type MlInsightsPayload = {
  model_type?: string
  target?: string
  n_posts?: number
  model_performance?: ModelPerformance
  ols_r2?: number
  ols_coefficients?: OlsCoefficient[]
  feature_importances?: FeatureImportance[]
  what_if_scenarios?: WhatIfScenario[]
  top_recommendations?: TopRecommendations
}

type MlDashboardPayload = {
  meta: { nPosts: number; weeklyMean: number; weeklyMedian: number; weeklyStd: number }
  platformAvgReferrals: LabelDecimalSeries
  platformDonationSignalRate: LabelDecimalSeries
  postTypeAvgReferrals: LabelDecimalSeries
  postTypeAvgEngagement: LabelDecimalSeries
  hourAvgReferrals: LabelDecimalSeries
  dayOfWeekAvgReferrals: LabelDecimalSeries
  cadence: LabelIntSeries
  topPostTypePlatformCombos: { label: string; avgReferrals: number }[]
  mlInsights?: MlInsightsPayload | null
}

/* ─── Helpers ─── */

function zipDecimal(s: LabelDecimalSeries) {
  return s.labels.map((name, i) => ({ name, value: s.values[i] ?? 0 }))
}

function zipCadence(s: LabelIntSeries) {
  return s.labels.map((name, i) => ({ week: name, posts: s.values[i] ?? 0 }))
}

const PALETTE = {
  primary: '#4f46e5',
  green: '#059669',
  amber: '#d97706',
  red: '#dc2626',
  sky: '#0ea5e9',
  purple: '#9333ea',
  slate: '#64748b',
}

/* ─── Small components ─── */

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-surface-text">{label}</div>
      <div className="mt-1 text-xl font-bold text-surface-dark">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-surface-text">{sub}</div>}
    </div>
  )
}

function Section({
  title,
  hint,
  children,
  tall,
}: {
  title: string
  hint?: string
  children: React.ReactNode
  tall?: boolean
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-sm">
      <h2 className="text-base font-semibold text-surface-dark">{title}</h2>
      {hint && <p className="mt-1 text-sm text-surface-text">{hint}</p>}
      <div className={`mt-4 w-full ${tall ? 'h-80' : 'h-64'}`}>{children}</div>
    </section>
  )
}

function Badge({ text, color }: { text: string; color: 'green' | 'amber' | 'red' | 'slate' }) {
  const cls = {
    green: 'bg-green-100 text-green-800 border-green-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${cls[color]}`}>
      {text}
    </span>
  )
}

/* ─── Prefetch: fires as soon as this chunk loads, before React mounts ─── */

let inflightPromise: Promise<MlDashboardPayload> | null = null

function fetchMlDashboard(): Promise<MlDashboardPayload> {
  if (!inflightPromise) {
    inflightPromise = api
      .get<MlDashboardPayload>('/api/social-media/ml-dashboard')
      .then((r) => r.data)
      .finally(() => { inflightPromise = null })
  }
  return inflightPromise
}

fetchMlDashboard()

/* ─── Page ─── */

export function SocialMediaPage() {
  const [data, setData] = useState<MlDashboardPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchMlDashboard()
      .then((d) => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setError('Unable to load social media analytics.') })
    return () => { cancelled = true }
  }, [])

  const ml = data?.mlInsights
  const perf = ml?.model_performance
  const recs = ml?.top_recommendations

  const fiChart = useMemo(() => {
    if (!ml?.feature_importances) return []
    return [...ml.feature_importances]
      .sort((a, b) => a.importance - b.importance)
  }, [ml])

  const olsChart = useMemo(() => {
    if (!ml?.ols_coefficients) return []
    return [...ml.ols_coefficients].sort((a, b) => a.coef - b.coef)
  }, [ml])

  const whatIfChart = useMemo(() => {
    if (!ml?.what_if_scenarios) return []
    return ml.what_if_scenarios.map((s) => ({
      name: s.name,
      full: s.description,
      referrals: s.predicted_referrals,
    }))
  }, [ml])

  const comboChartData = useMemo(() => {
    if (!data) return []
    return data.topPostTypePlatformCombos.slice(0, 8).map((c) => ({
      name: c.label.length > 28 ? `${c.label.slice(0, 26)}…` : c.label,
      full: c.label,
      referrals: c.avgReferrals,
    }))
  }, [data])

  return (
    <div className="min-h-full text-surface-dark">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-dark">Social Media Strategy</h1>
          <p className="mt-1 text-sm text-surface-text">
            ML-powered analysis of {ml?.n_posts ?? data?.meta.nPosts ?? '…'} posts.
            Insights derived from a {ml?.model_type ?? 'predictive model'} and OLS causal regression.
          </p>
        </div>

        {error ? (
          <div className="mt-6"><ErrorMessage message={error} /></div>
        ) : !data ? (
          <div className="mt-10 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <>
            {/* ═══════ 1. RECOMMENDATIONS ═══════ */}
            {ml?.ols_coefficients && ml.ols_coefficients.length > 0 && (
              <div className="mt-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50/80 to-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-green-900">Recommendations</h2>
                <p className="mt-1 text-sm text-green-800/80">
                  Based on our ML analysis of {ml.n_posts ?? data.meta.nPosts} posts, here is what we recommend to maximize donation referrals — and how much better each action is expected to perform.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {ml.ols_coefficients
                    .filter((c) => c.significant && c.coef > 0)
                    .sort((a, b) => b.coef - a.coef)
                    .map((c, idx) => {
                      const best = whatIfChart.length > 0 ? Math.max(...whatIfChart.map((s) => s.referrals)) : null
                      const generic = whatIfChart.length > 0 ? Math.min(...whatIfChart.map((s) => s.referrals)) : null
                      const multiplier = best != null && generic != null && generic > 0 ? best / generic : null
                      return (
                        <div key={c.feature} className="flex gap-4 rounded-xl border border-green-200 bg-white p-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-green-900">{c.feature}</span>
                              <Badge text={`p = ${c.p_value.toFixed(3)}`} color="green" />
                            </div>
                            <div className="mt-1 text-xl font-bold text-green-700">
                              +{c.coef.toFixed(1)} referrals per post
                            </div>
                            <div className="mt-0.5 text-xs text-surface-text">
                              {idx === 0 && multiplier != null
                                ? `Strongest driver. Posts with all recommendations → ${best?.toFixed(0)} predicted referrals vs ${generic?.toFixed(0)} without.`
                                : 'per unit increase, all else equal (OLS regression)'}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>

                {whatIfChart.length >= 2 && (() => {
                  const best = whatIfChart.reduce((a, b) => (a.referrals > b.referrals ? a : b))
                  const worst = whatIfChart.reduce((a, b) => (a.referrals < b.referrals ? a : b))
                  return (
                    <div className="mt-5 rounded-xl border border-green-100 bg-green-50/40 p-4">
                      <div className="text-sm font-semibold text-green-900">Expected Performance Comparison</div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-green-200 bg-white px-4 py-3 text-center">
                          <div className="text-xs uppercase tracking-wide text-surface-text">Following all recommendations</div>
                          <div className="mt-1 text-3xl font-bold text-green-700">{best.referrals.toFixed(1)}</div>
                          <div className="text-xs text-surface-text">predicted referrals — {best.full}</div>
                        </div>
                        <div className="rounded-lg border border-red-200 bg-white px-4 py-3 text-center">
                          <div className="text-xs uppercase tracking-wide text-surface-text">Generic post (none applied)</div>
                          <div className="mt-1 text-3xl font-bold text-red-600">{worst.referrals.toFixed(1)}</div>
                          <div className="text-xs text-surface-text">predicted referrals — {worst.full}</div>
                        </div>
                      </div>
                      {best.referrals > 0 && worst.referrals > 0 && (
                        <p className="mt-3 text-center text-sm font-semibold text-green-800">
                          That's {(best.referrals / worst.referrals).toFixed(0)}× more referrals when you apply the model's recommendations.
                        </p>
                      )}
                      {worst.referrals === 0 && (
                        <p className="mt-3 text-center text-sm font-semibold text-green-800">
                          Applying the model's recommendations takes a post from near-zero to an estimated {best.referrals.toFixed(0)} donation referrals.
                        </p>
                      )}
                    </div>
                  )
                })()}

                {recs && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-green-100 bg-white px-3 py-2">
                      <div className="text-xs uppercase tracking-wide text-surface-text">Best platform (avg)</div>
                      <div className="text-lg font-bold">{recs.best_platform ?? '—'}</div>
                      {recs.best_platform_avg != null && <div className="text-xs text-surface-text">{recs.best_platform_avg.toFixed(1)} avg referrals/post</div>}
                    </div>
                    <div className="rounded-lg border border-green-100 bg-white px-3 py-2">
                      <div className="text-xs uppercase tracking-wide text-surface-text">Best timing (avg)</div>
                      <div className="text-lg font-bold">{recs.best_day ?? '—'} at {recs.best_hour != null ? `${recs.best_hour}:00` : '—'}</div>
                    </div>
                    <div className="rounded-lg border border-green-100 bg-white px-3 py-2">
                      <div className="text-xs uppercase tracking-wide text-surface-text">Best topic (avg)</div>
                      <div className="text-lg font-bold">{recs.best_topic ?? '—'}</div>
                    </div>
                  </div>
                )}

                {perf && (
                  <p className="mt-4 text-xs text-green-700/70">
                    Model confidence: R² = {perf.r2.toFixed(2)} (cross-validated {perf.cv_r2_mean.toFixed(2)} ± {perf.cv_r2_std.toFixed(2)}),{' '}
                    {perf.improvement_over_baseline_pct.toFixed(0)}% more accurate than guessing the average.
                    Recommendations are from OLS causal regression (R² = {(ml.ols_r2 ?? 0).toFixed(2)}) using only pre-publication features you can control.
                  </p>
                )}
              </div>
            )}

            {/* ═══════ 2. FEATURE IMPORTANCE (RF) ═══════ */}
            {fiChart.length > 0 && (
              <div className="mt-8">
                <Section
                  title="What the Model Says Matters Most"
                  hint="Permutation importance from the Random Forest: how much each feature moves the prediction when shuffled. Higher = more influential."
                  tall
                >
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={fiChart} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="feature" width={155} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [Number(v).toFixed(4), 'Importance']} />
                      <Bar dataKey="importance" name="Permutation importance" radius={[0, 6, 6, 0]}>
                        {fiChart.map((entry, i) => (
                          <Cell key={i} fill={entry.importance > 0.05 ? PALETTE.primary : PALETTE.slate} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Section>
              </div>
            )}

            {/* ═══════ 3. OLS CAUSAL DRIVERS ═══════ */}
            {olsChart.length > 0 && (
              <>
                <h2 className="mt-8 text-lg font-bold text-surface-dark">Causal Drivers — OLS Regression</h2>
                <p className="mt-1 text-sm text-surface-text">
                  Coefficients from OLS linear regression (R² = {(ml?.ols_r2 ?? 0).toFixed(2)}).
                  Only pre-publication features the team can control. Green bars are statistically significant (p &lt; 0.05).
                </p>
                <div className="mt-4">
                  <Section title="Effect on Predicted Donation Referrals" hint="Each bar shows how much one unit of that feature changes predicted referrals, holding others constant." tall>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={olsChart} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="feature" width={185} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(v, _name, props) => {
                            const item = props.payload as OlsCoefficient
                            return [`${Number(v) > 0 ? '+' : ''}${Number(v).toFixed(2)}  (p = ${item.p_value.toFixed(3)})`, 'Coefficient']
                          }}
                        />
                        <Bar dataKey="coef" name="OLS Coefficient" radius={[0, 6, 6, 0]}>
                          {olsChart.map((entry, i) => (
                            <Cell key={i} fill={entry.significant ? PALETTE.green : PALETTE.slate} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {olsChart
                    .filter((c) => c.significant)
                    .sort((a, b) => Math.abs(b.coef) - Math.abs(a.coef))
                    .map((c) => (
                      <div key={c.feature} className="rounded-xl border border-green-200 bg-green-50/60 p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-green-900">{c.feature}</span>
                          <Badge text={`p=${c.p_value.toFixed(3)}`} color="green" />
                        </div>
                        <div className="mt-1 text-xl font-bold text-green-800">
                          {c.coef > 0 ? '+' : ''}{c.coef.toFixed(1)} referrals
                        </div>
                        <div className="mt-0.5 text-xs text-green-700/80">per unit increase, holding all else equal</div>
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* ═══════ 4. WHAT-IF SCENARIOS ═══════ */}
            {whatIfChart.length > 0 && (
              <>
                <h2 className="mt-8 text-lg font-bold text-surface-dark">What-If Scenarios</h2>
                <p className="mt-1 text-sm text-surface-text">
                  Predicted donation referrals from the OLS model for hypothetical post configurations.
                  Shows how combining features stacks up.
                </p>
                <div className="mt-4">
                  <Section title="OLS-Predicted Referrals by Scenario" hint="Each bar is a model prediction, not a historical average.">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart data={whatIfChart} margin={{ bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={50} />
                        <YAxis />
                        <Tooltip
                          formatter={(v) => [Number(v).toFixed(1), 'Predicted referrals']}
                          labelFormatter={(_, p) => String((p?.[0]?.payload as { full?: string } | undefined)?.full ?? '')}
                        />
                        <Bar dataKey="referrals" name="Predicted referrals" radius={[6, 6, 0, 0]}>
                          {whatIfChart.map((entry, i) => (
                            <Cell key={i} fill={entry.referrals > 30 ? PALETTE.green : entry.referrals > 5 ? PALETTE.amber : PALETTE.red} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Section>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {whatIfChart.map((s) => (
                    <div key={s.name} className={`rounded-xl border p-4 ${s.referrals > 30 ? 'border-green-200 bg-green-50/60' : s.referrals > 5 ? 'border-amber-200 bg-amber-50/60' : 'border-red-200 bg-red-50/60'}`}>
                      <div className="text-sm font-semibold text-surface-dark">{s.name}</div>
                      <div className={`mt-1 text-2xl font-bold ${s.referrals > 30 ? 'text-green-700' : s.referrals > 5 ? 'text-amber-700' : 'text-red-700'}`}>
                        {s.referrals.toFixed(1)}
                      </div>
                      <div className="mt-0.5 text-xs text-surface-text">{s.full}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ═══════ 5. MODEL PERFORMANCE ═══════ */}
            {perf && (
              <div className="mt-8">
                <h2 className="text-lg font-bold text-surface-dark">Model Performance</h2>
                <p className="mt-1 text-sm text-surface-text">
                  How well the Random Forest predicts donation referrals vs. a baseline that always guesses the average.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    label="Model R²"
                    value={perf.r2.toFixed(2)}
                    sub={`Cross-val: ${perf.cv_r2_mean.toFixed(2)} ± ${perf.cv_r2_std.toFixed(2)}`}
                  />
                  <MetricCard
                    label="Improvement over baseline"
                    value={`${perf.improvement_over_baseline_pct.toFixed(0)}%`}
                    sub={`RMSE ${perf.rmse.toFixed(1)} vs baseline ${perf.baseline_rmse.toFixed(1)}`}
                  />
                  <MetricCard
                    label="Mean Absolute Error"
                    value={perf.mae.toFixed(1)}
                    sub={`Baseline MAE: ${perf.baseline_mae.toFixed(1)}`}
                  />
                  <MetricCard
                    label="Overfitting gap"
                    value={`${(((perf.test_rmse - perf.train_rmse) / perf.train_rmse) * 100).toFixed(0)}%`}
                    sub={`Train RMSE ${perf.train_rmse.toFixed(1)} → Test ${perf.test_rmse.toFixed(1)}`}
                  />
                </div>
              </div>
            )}

            {/* ═══════ 6. SUPPORTING DATA — CHARTS ═══════ */}
            <h2 className="mt-8 text-lg font-bold text-surface-dark">Supporting Data</h2>
            <p className="mt-1 text-sm text-surface-text">
              Descriptive statistics from {data.meta.nPosts} posts. These are raw averages, not model predictions.
            </p>

            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <Section title="Avg Referrals by Hour" hint="When posts historically get the most referrals.">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={zipDecimal(data.hourAvgReferrals)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Avg referrals" fill={PALETTE.amber} radius={[4, 4, 0, 0]}>
                      {zipDecimal(data.hourAvgReferrals).map((entry, i) => (
                        <Cell key={i} fill={recs?.best_hour != null && entry.name === `${String(recs.best_hour).padStart(2, '0')}:00` ? PALETTE.green : PALETTE.amber} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Section>

              <Section title="Avg Referrals by Day of Week" hint="Which days historically perform best.">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={zipDecimal(data.dayOfWeekAvgReferrals)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Avg referrals" fill={PALETTE.sky} radius={[6, 6, 0, 0]}>
                      {zipDecimal(data.dayOfWeekAvgReferrals).map((entry, i) => (
                        <Cell key={i} fill={recs?.best_day != null && entry.name === recs.best_day ? PALETTE.green : PALETTE.sky} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Section>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Section title="Posts per Week Over Time" hint="Consistency matters for audience growth." tall>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={zipCadence(data.cadence)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="posts" name="Posts" stroke={PALETTE.sky} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Section>

              <Section title="Top Post Type + Platform Combos" hint="Which specific combos get the most referrals (avg)." tall>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={comboChartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(v) => [Number(v).toFixed(2), 'Avg referrals']}
                      labelFormatter={(_, p) => String((p?.[0]?.payload as { full?: string } | undefined)?.full ?? '')}
                    />
                    <Bar dataKey="referrals" name="Avg referrals" fill={PALETTE.primary} radius={[0, 6, 6, 0]}>
                      {comboChartData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? PALETTE.green : PALETTE.primary} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Section>
            </div>

            {/* ═══════ Referrals vs Engagement ═══════ */}
            {data.postTypeAvgReferrals.labels.length > 0 && (
              <div className="mt-6">
                <Section title="Referrals vs Engagement by Post Type" hint="Blue = avg donation referrals. Orange = engagement rate (scaled). High referrals + high engagement = sweet spot.">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <ComposedChart
                      data={data.postTypeAvgReferrals.labels.map((name, i) => {
                        const maxR = Math.max(...data.postTypeAvgReferrals.values, 1e-6)
                        const maxE = Math.max(...data.postTypeAvgEngagement.values, 1e-6)
                        return {
                          name,
                          referrals: +(data.postTypeAvgReferrals.values[i] ?? 0).toFixed(2),
                          engagement: +(((data.postTypeAvgEngagement.values[i] ?? 0) / maxE) * maxR).toFixed(2),
                        }
                      })}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="referrals" name="Avg donation referrals" fill={PALETTE.primary} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="engagement" name="Engagement (scaled)" fill={PALETTE.amber} radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Section>
              </div>
            )}

            {/* ═══════ Footer ═══════ */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-surface-text">
              <strong>How to read this page:</strong> Sections 1–4 are derived from the ML pipeline
              (Random Forest + OLS regression trained on {data.meta.nPosts} posts).
              The &quot;Supporting Data&quot; section shows raw descriptive averages for additional context.
              {perf && (
                <> The predictive model explains {(perf.r2 * 100).toFixed(0)}% of variance and is{' '}
                {perf.improvement_over_baseline_pct.toFixed(0)}% more accurate than guessing the average. Refresh nightly via the automated pipeline.</>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
