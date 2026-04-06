import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function CookieBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const v = localStorage.getItem('np_cookie_consent')
    if (!v) setOpen(true)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-700">
          This site uses essential cookies. By continuing you accept our privacy policy.
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              localStorage.setItem('np_cookie_consent', 'declined')
              setOpen(false)
            }}
            className="rounded-md border px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Decline
          </button>
          <button
            onClick={() => {
              localStorage.setItem('np_cookie_consent', 'accepted')
              setOpen(false)
            }}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

export function PrivacyPage() {
  return (
    <div className="min-h-full bg-slate-50">
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
            <Link to="/" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              Back to Home
            </Link>
          </div>

          <p className="mt-3 text-slate-700">
            Nova Path is committed to protecting the privacy and safety of the people we serve.
            This application may support case management and impact reporting. We minimize data
            collection and apply strict access controls.
          </p>

          <section className="mt-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Data We Collect</h2>
            <ul className="list-disc space-y-2 pl-5 text-slate-700">
              <li>Account data for staff and donors (email, authentication tokens).</li>
              <li>
                Case management records used by authorized staff only, which may include sensitive
                information about minors and vulnerable individuals.
              </li>
              <li>Donor/supporter contact and donation history for stewardship and compliance.</li>
              <li>Technical logs required to secure, operate, and audit the system.</li>
            </ul>
          </section>

          <section className="mt-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">How We Use It</h2>
            <ul className="list-disc space-y-2 pl-5 text-slate-700">
              <li>To provide secure access to authorized staff and donors.</li>
              <li>To coordinate services, care plans, and follow-up actions.</li>
              <li>
                To produce anonymized, aggregate impact reporting that never reveals resident
                identities.
              </li>
              <li>To prevent fraud, abuse, and unauthorized access.</li>
            </ul>
          </section>

          <section className="mt-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Data Retention</h2>
            <p className="text-slate-700">
              We retain data only as long as necessary for service delivery, legal obligations, and
              safeguarding. Highly sensitive case notes are restricted and access is logged.
              Retention schedules are reviewed regularly and data is deleted or anonymized when no
              longer required.
            </p>
          </section>

          <section className="mt-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Your Rights</h2>
            <p className="text-slate-700">
              Depending on your location, you may have rights to request access, correction,
              deletion, restriction, or portability of personal data. For safety reasons, requests
              related to case data may require identity verification and may be limited where
              disclosure could cause harm.
            </p>
          </section>

          <section className="mt-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Contact Us</h2>
            <p className="text-slate-700">
              Questions or concerns can be sent to{' '}
              <a className="font-semibold text-slate-900" href="mailto:privacy@novapath.org">
                privacy@novapath.org
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <CookieBanner />
    </div>
  )
}

