import React, { createContext, useContext, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { decodeEmail, decodeRoles } from '../auth/jwt'

type AuthUser = {
  email: string
  roles: string[]
}

type AuthContextValue = {
  token: string | null
  user: AuthUser | null
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readInitial(): { token: string | null; user: AuthUser | null } {
  const token = localStorage.getItem('np_token')
  if (!token) return { token: null, user: null }
  const email = decodeEmail(token)
  const roles = decodeRoles(token)
  if (!email) return { token: null, user: null }
  return { token, user: { email, roles } }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(readInitial, [])
  const [token, setToken] = useState<string | null>(initial.token)
  const [user, setUser] = useState<AuthUser | null>(initial.user)

  async function login(email: string, password: string) {
    const res = await api.post<{ token: string }>('/api/auth/login', { email, password })
    const t = res.data.token
    localStorage.setItem('np_token', t)
    const decodedEmail = decodeEmail(t) || email
    const roles = decodeRoles(t)
    const u = { email: decodedEmail, roles }
    setToken(t)
    setUser(u)
    return u
  }

  function logout() {
    localStorage.removeItem('np_token')
    setToken(null)
    setUser(null)
  }

  function hasRole(role: string) {
    return !!user?.roles?.includes(role)
  }

  const value: AuthContextValue = { token, user, login, logout, hasRole }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

