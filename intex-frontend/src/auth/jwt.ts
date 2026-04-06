import { jwtDecode } from 'jwt-decode'

type AnyJwt = Record<string, unknown>

const ROLE_URI = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
const EMAIL_URI = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'

export function decodeRoles(token: string): string[] {
  const decoded = jwtDecode<AnyJwt>(token)
  const role = decoded['role'] ?? decoded[ROLE_URI]
  if (Array.isArray(role)) return role.filter((x) => typeof x === 'string') as string[]
  if (typeof role === 'string') return [role]
  return []
}

export function decodeEmail(token: string): string | null {
  const decoded = jwtDecode<AnyJwt>(token)
  const email = decoded['email'] ?? decoded[EMAIL_URI]
  return typeof email === 'string' ? email : null
}

