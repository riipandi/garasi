import { redirect, type ParsedLocation } from '@tanstack/react-router'
import { decodeJwt } from 'jose'
import { authStore } from '~/app/stores'
import type { JWTClaims } from '~/shared/schemas/auth.schema'

export function extractSessionIdFromToken(token: string): string | null {
  try {
    const payload = decodeJwt<JWTClaims>(token)
    return payload?.sid || null
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

export function isTokenExpired(expiry: number | null, bufferSeconds: number = 60): boolean {
  if (!expiry) return true
  const now = Math.floor(Date.now() / 1000)
  return expiry <= now + bufferSeconds
}

export function requireAuthentication(location: ParsedLocation) {
  const authState = authStore.get()
  const isAuthenticated = !!authState?.token

  if (!isAuthenticated) {
    throw redirect({
      to: '/signin',
      search: {
        redirect: location.pathname
      }
    })
  }
}
