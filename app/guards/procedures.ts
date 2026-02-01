import { decodeJwt } from 'jose/jwt/decode'
import { ofetch } from 'ofetch'
import { toast } from '~/app/components/toast'
import { logout } from '~/app/services/auth.service'
import { authStore } from '~/app/stores'
import type { JWTClaims } from '~/shared/schemas/auth.schema'

/**
 * Extract session ID from access token using jose library
 *
 * @param token - The access token
 * @returns The session ID or null if not found
 */
export function extractSessionIdFromToken(token: string): string | null {
  try {
    const payload = decodeJwt<JWTClaims>(token)
    return payload?.sid || null
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

/**
 * Check if access token is expired or will expire soon
 *
 * @param expiry - Token expiry timestamp (Unix timestamp in seconds)
 * @param bufferSeconds - Buffer time in seconds before expiry (default: 60 seconds)
 * @returns True if token is expired or will expire soon
 */
export function isTokenExpired(expiry: number | null, bufferSeconds: number = 30): boolean {
  if (!expiry) return true
  const now = Math.floor(Date.now() / 1000)
  return expiry <= now + bufferSeconds
}

/**
 * Refresh access token using refresh token
 *
 * @param refreshToken - The refresh token to use
 * @returns New tokens or null if refresh failed
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  access_token_expiry: number
  refresh_token_expiry: number
  sid: string
} | null> {
  try {
    const response = await ofetch<{
      status: 'success' | 'error'
      message: string
      data: {
        access_token: string
        refresh_token: string
        access_token_expiry: number
        refresh_token_expiry: number
        sid: string
      }
      error: any
    }>('/api/auth/refresh', {
      method: 'POST',
      body: {
        refresh_token: refreshToken,
        session_id: extractSessionIdFromToken(refreshToken) || ''
      }
    })

    if (response.status === 'success' && response.data) {
      // Update auth store with new tokens
      const currentAuth = authStore.get()
      authStore.set({
        atoken: response.data.access_token,
        atokenexp: response.data.access_token_expiry,
        rtoken: response.data.refresh_token,
        rtokenexp: response.data.refresh_token_expiry,
        remember: currentAuth.remember
      })

      return response.data
    }

    return null
  } catch (error) {
    console.error('Failed to refresh token:', error)
    toast.add({
      title: 'Session Expired',
      description: 'Your session has expired. Please sign in again.',
      type: 'error',
      timeout: 7000
    })
    return null
  }
}

/**
 * Logout function to clear auth state and call logout endpoint
 *
 * @returns Promise that resolves when logout is complete
 */
export async function signout(): Promise<void> {
  const authState = authStore.get()

  if (authState?.rtoken && authState?.atoken) {
    const sessionId = extractSessionIdFromToken(authState.atoken)
    if (sessionId) {
      try {
        // Call logout endpoint to revoke refresh token and deactivate session
        await logout()
      } catch (error) {
        console.error('Logout API call failed:', error)
      }
    } else {
      try {
        // Fallback: try logout without session ID
        await ofetch('/api/auth/logout', {
          method: 'POST',
          body: {
            refresh_token: authState.rtoken,
            session_id: ''
          }
        })
      } catch (error) {
        console.error('Logout API call failed:', error)
      }
    }
  }

  // Clear auth store
  authStore.set({ atoken: null, atokenexp: null, rtoken: null, rtokenexp: null, remember: false })
}

/**
 * Event listener for session expired events
 * This allows components to listen to session expiry and handle it appropriately
 */
type SessionExpiredListener = () => void
const sessionExpiredListeners: SessionExpiredListener[] = []

export function onSessionExpired(callback: SessionExpiredListener) {
  sessionExpiredListeners.push(callback)
  return () => {
    const index = sessionExpiredListeners.indexOf(callback)
    if (index > -1) {
      sessionExpiredListeners.splice(index, 1)
    }
  }
}
