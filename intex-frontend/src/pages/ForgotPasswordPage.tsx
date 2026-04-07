import { Link } from 'react-router-dom'

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen text-surface-dark flex items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-2xl border border-brand-100 bg-surface p-8">
        <h1 className="text-2xl font-bold mb-3">Forgot your password?</h1>
        <p className="text-surface-text text-sm leading-relaxed">
          Password reset is not connected yet in this demo environment. Please contact an
          administrator to reset your account access.
        </p>
        <div className="mt-6">
          <Link
            to="/login"
            className="inline-flex rounded-md bg-brand px-4 py-2 text-sm font-semibold text-surface hover:bg-brand-dark"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
