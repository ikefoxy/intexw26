import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
  }`

export function NavBar() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/admin" className="font-semibold tracking-tight text-slate-900">
            Nova Path
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/admin" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/residents" className={navLinkClass}>
              Residents
            </NavLink>
            <NavLink to="/admin/donors" className={navLinkClass}>
              Donors
            </NavLink>
            <NavLink to="/admin/reports" className={navLinkClass}>
              Reports
            </NavLink>
            <NavLink to="/admin/social-media" className={navLinkClass}>
              Social Media
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-sm text-slate-600 sm:block">{user?.email}</div>
            <button
              onClick={logout}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

