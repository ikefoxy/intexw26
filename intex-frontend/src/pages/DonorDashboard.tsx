import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarIcon, HeartIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react'
import { NavBar } from '../components/NavBar'
import { getMyDonations, getPublicImpactSnapshot, type Donation } from '../lib/api'
import { formatDate, formatUsd } from '../lib/locale'
import { useAuth } from '../state/AuthContext'

function toVagueCount(value: number, step = 10): string {
  if (!Number.isFinite(value) || value <= 0) return '0+'
  if (value < step) return `${Math.floor(value)}+`
  const rounded = Math.floor(value / step) * step
  return `${rounded}+`
}

export function DonorDashboard() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [residentsSupported, setResidentsSupported] = useState<number>(0)
  const [activeSafehouses, setActiveSafehouses] = useState<number>(0)
  const [totalDonors, setTotalDonors] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  const donorName = user?.email?.split('@')[0] || t('donor_default_name')

  const lifetimeGiving = useMemo(
    () => donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0),
    [donations]
  )

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [donationRows, snapshot] = await Promise.all([getMyDonations(), getPublicImpactSnapshot()])
      setDonations(donationRows)
      setResidentsSupported(snapshot.residentsSupported ?? 0)
      setActiveSafehouses(snapshot.activeSafehouses ?? 0)
      setTotalDonors(snapshot.totalDonors ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('donor_load_error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  return (
    <div className="min-h-full bg-brand-50 text-surface-dark">
      <NavBar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{t('donor_dashboard_eyebrow')}</p>
          <h1 className="mt-2 text-3xl font-bold text-surface-dark">
            {t('donor_dashboard_title', { name: donorName })}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-surface-text">
            {t('donor_dashboard_intro')}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/donate"
              className="inline-flex rounded-md bg-brand px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-dark"
            >
              {t('nav_make_donation')}
            </Link>
            <span className="text-sm text-surface-text">{t('donor_dashboard_thank_you')}</span>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-brand">
              <UsersIcon className="h-5 w-5" />
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-text">{t('donor_helped_people_label')}</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-dark">{loading ? '...' : toVagueCount(residentsSupported, 5)}</p>
            <p className="mt-1 text-sm text-surface-text">{t('donor_helped_people_caption')}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-brand">
              <ShieldCheckIcon className="h-5 w-5" />
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-text">{t('donor_safehouses_supported')}</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-dark">{loading ? '...' : toVagueCount(activeSafehouses, 5)}</p>
            <p className="mt-1 text-sm text-surface-text">{t('donor_safehouse_caption')}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-brand">
              <HeartIcon className="h-5 w-5" />
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-text">{t('donor_community_donors')}</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-dark">{loading ? '...' : toVagueCount(totalDonors, 25)}</p>
            <p className="mt-1 text-sm text-surface-text">{t('donor_community_caption')}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-brand">
              <HeartIcon className="h-5 w-5" />
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-text">{t('donate_lifetime_giving')}</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-dark">
              {loading ? '...' : formatUsd(lifetimeGiving, i18n.resolvedLanguage)}
            </p>
            <p className="mt-1 text-sm text-surface-text">{t('donor_lifetime_caption')}</p>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-surface-dark">
              <CalendarIcon className="h-4 w-4 text-brand" />
              {t('donate_history_title')}
            </h2>
            <div className="text-xs text-surface-text">{user?.email}</div>
          </div>

          {loading && <p className="px-5 py-3 text-sm text-surface-text">{t('donate_history_loading')}</p>}
          {!loading && error && <p className="px-5 py-3 text-sm text-red-500">{error}</p>}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-sm text-surface-text">
                  <th className="px-5 py-3 font-medium">{t('table_date')}</th>
                  <th className="px-5 py-3 font-medium">{t('table_designation')}</th>
                  <th className="px-5 py-3 font-medium">{t('table_amount')}</th>
                  <th className="px-5 py-3 font-medium">{t('table_status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!loading && donations.length === 0 && (
                  <tr>
                    <td className="px-5 py-4 text-sm text-surface-text" colSpan={4}>
                      {t('donate_no_records')}
                    </td>
                  </tr>
                )}
                {donations.map((d) => (
                  <tr key={d.donationId} className="hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm text-surface-text">{formatDate(d.donationDate, i18n.resolvedLanguage)}</td>
                    <td className="px-5 py-4 text-sm font-medium text-surface-dark">
                      {d.campaignName || d.designation || t('donate_general_fund')}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-surface-dark">{formatUsd(Number(d.amount), i18n.resolvedLanguage)}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        {t('donate_completed')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-surface-dark">{t('donor_dashboard_where_title')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-surface-text">{t('donor_dashboard_where_intro')}</p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-surface-text">{t('donor_dashboard_where_1')}</div>
            <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-surface-text">{t('donor_dashboard_where_2')}</div>
            <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-surface-text">{t('donor_dashboard_where_3')}</div>
          </div>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </section>
      </main>
    </div>
  )
}

export default DonorDashboard
