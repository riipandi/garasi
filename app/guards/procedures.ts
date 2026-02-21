import { redirect, type ParsedLocation } from '@tanstack/react-router'
import { decodeJwt } from 'jose'
import { ofetch } from 'ofetch'
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

export function isRefreshTokenExpired(expiry: number | null): boolean {
  if (!expiry) return true
  const now = Math.floor(Date.now() / 1000)
  return expiry <= now
}

export async function refreshAccessToken(): Promise<{
  access_token: string
  refresh_token: string
  access_token_expiry: number
  refresh_token_expiry: number
  sessid: string
} | null> {
  const authState = authStore.get()
  if (!authState?.rtoken || !authState?.sessid) {
    return null
  }

  try {
    const response = await ofetch<{
      status: 'success' | 'error'
      message: string
      data: {
        session_id: string
        access_token: string
        refresh_token: string
        access_token_expiry: number
        refresh_token_expiry: number
      }
      error: any
    }>('/api/auth/refresh', {
      method: 'POST',
      body: {
        refresh_token: authState.rtoken,
        session_id: authState.sessid
      }
    })

    if (response.status === 'success' && response.data) {
      const currentAuth = authStore.get()
      authStore.set({
        atoken: response.data.access_token,
        atokenexp: response.data.access_token_expiry,
        rtoken: response.data.refresh_token,
        rtokenexp: response.data.refresh_token_expiry,
        sessid: response.data.session_id,
        remember: currentAuth.remember
      })

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        access_token_expiry: response.data.access_token_expiry,
        refresh_token_expiry: response.data.refresh_token_expiry,
        sessid: response.data.session_id
      }
    }

    return null
  } catch (error) {
    console.error('Failed to refresh token:', error)
    return null
  }
}

export async function signout(): Promise<void> {
  const authState = authStore.get()

  if (authState?.rtoken) {
    const sessionId = authState.sessid || ''
    try {
      await ofetch('/api/auth/logout', {
        method: 'POST',
        body: {
          refresh_token: authState.rtoken,
          session_id: sessionId
        }
      })
    } catch (error) {
      console.error('Logout API call failed:', error)
    }
  }

  authStore.set({
    atoken: null,
    atokenexp: null,
    rtoken: null,
    rtokenexp: null,
    sessid: null,
    remember: false
  })
}

export function requireAuthentication(location: ParsedLocation) {
  const authState = authStore.get()
  const isAuthenticated = !!authState?.atoken

  if (!isAuthenticated) {
    throw redirect({
      to: '/signin',
      search: {
        redirect: location.pathname
      }
    })
  }
}
