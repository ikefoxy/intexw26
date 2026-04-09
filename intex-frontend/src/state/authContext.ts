import { createContext } from 'react'

export type AuthUser = {
  email: string
  roles: string[]
}

export type MfaPendingState = {
  mfaToken: string
  email?: string
  requiresMfaSetup?: boolean
  sharedKey?: string
  authenticatorUri?: string
}

export type AuthContextValue = {
  token: string | null
  user: AuthUser | null
  pendingMfa: MfaPendingState | null
  login: (email: string, password: string) => Promise<AuthUser | null>
  verifyMfa: (code: string) => Promise<AuthUser>
  getMfaSetup: () => Promise<{ sharedKey?: string; authenticatorUri?: string }>
  enableMfa: (code: string) => Promise<void>
  signup: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
  hasRole: (role: string) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

