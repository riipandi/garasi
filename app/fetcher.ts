import type { $Fetch, FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'
import { authStore } from '~/app/stores'

/**
 * Refresh access token using refresh token
 *
 * @param refreshToken - The refresh token to use
 * @param sessionId - The session ID to update
 * @returns New tokens or null if refresh failed
 */
async function refreshAccessToken(
  refreshToken: string,
  sessionId: string
): Promise<{
  access_token: string
  refresh_token: string
  access_token_expiry: number
  refresh_token_expiry: number
} | null> {
  try {
    const response = await ofetch<{
      success: boolean
      data: {
        access_token: string
        refresh_token: string
        access_token_expiry: number
        refresh_token_expiry: number
      }
    }>('/api/auth/refresh', {
      method: 'POST',
      body: {
        refresh_token: refreshToken,
        session_id: sessionId
      }
    })

    if (response.success && response.data) {
      // Update auth store with new tokens
      const currentAuth = authStore.get()
      authStore.set({
        sessid: currentAuth.sessid,
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
function isTokenExpired(expiry: number | null, bufferSeconds: number = 60): boolean {
  if (!expiry) return true
  const now = Math.floor(Date.now() / 1000)
  return expiry <= now + bufferSeconds
}

/**
 * Track in-progress refresh to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false
let refreshPromise: Promise<any> | null = null

/**
 * Create a fetcher instance with Bearer token interceptor and automatic token refresh
 *
 * This wrapper automatically adds Authorization header with Bearer token
 * and x-session-id header from auth store to all requests.
 * It also handles automatic token refresh when access token expires.
 *
 * @param baseUrl - The base URL for all requests
 * @param options - Additional fetch options
 * @returns A configured ofetch instance
 *
 * @example
 * ```tsx
 * const api = createFetcher('https://api.example.com')
 *
 * // GET request - automatically adds Bearer token and session ID
 * const data = await api('/users')
 *
 * // POST request - automatically adds Bearer token and session ID
 * const result = await api('/users', {
 *   method: 'POST',
 *   body: { name: 'John' }
 * })
 * ```
 */
export function createFetcher(baseUrl: string, options: FetchOptions = {}): $Fetch {
  return ofetch.create({
    baseURL: baseUrl,
    ...options,
    async onRequest({ options }) {
      // Get current auth state from store
      const authState = authStore.get()

      // Check if access token is expired or will expire soon
      if (authState?.atoken && authState?.rtoken && authState?.sessid) {
        if (isTokenExpired(authState.atokenexp)) {
          // If already refreshing, wait for existing refresh to complete
          if (isRefreshing && refreshPromise) {
            await refreshPromise
          } else {
            // Start a new refresh
            isRefreshing = true
            refreshPromise = refreshAccessToken(authState.rtoken, authState.sessid)
            await refreshPromise
            isRefreshing = false
            refreshPromise = null
          }

          // Get updated auth state after refresh
          const updatedAuthState = authStore.get()
          if (updatedAuthState?.atoken) {
            options.headers = new Headers(options.headers)
            options.headers.set('Authorization', `Bearer ${updatedAuthState.atoken}`)
          }
        } else {
          // Add Bearer token if access token exists and is valid
          options.headers = new Headers(options.headers)
          options.headers.set('Authorization', `Bearer ${authState.atoken}`)
        }

        // Add session ID header if session ID exists
        if (authState.sessid) {
          options.headers = options.headers || new Headers()
          if (!(options.headers instanceof Headers)) {
            options.headers = new Headers(options.headers)
          }
          options.headers.set('x-session-id', authState.sessid)
        }
      }
    },
    onResponseError({ response }) {
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        // Clear auth store on 401 error
        authStore.set({
          sessid: null,
          atoken: null,
          atokenexp: null,
          rtoken: null,
          rtokenexp: null,
          remember: false
        })
      }
    }
  })
}

/**
 * Default fetcher instance for API requests
 * Can be used directly or as a base for creating new fetchers
 *
 * @example
 * ```tsx
 * import { fetcher } from '~/app/fetcher'
 *
 * // GET request
 * const users = await fetcher('/users')
 *
 * // POST request
 * const result = await fetcher('/users', {
 *   method: 'POST',
 *   body: { name: 'John' }
 * })
 * ```
 */
export const fetcher = createFetcher('/api')

/**
 * Type-safe API client with typed responses
 *
 * @example
 * ```tsx
 * interface User {
 *   id: string
 *   name: string
 *   email: string
 * }
 *
 * const users = await fetcher<User[]>('/users')
 * const user = await fetcher<User>('/users/1')
 * ```
 */
export default fetcher

/**
 * Logout function to clear auth state and call logout endpoint
 *
 * @returns Promise that resolves when logout is complete
 */
export async function logout(): Promise<void> {
  const authState = authStore.get()

  if (authState?.rtoken && authState?.sessid) {
    try {
      // Call logout endpoint to revoke refresh token and deactivate session
      await ofetch('/api/auth/logout', {
        method: 'POST',
        body: {
          refresh_token: authState.rtoken,
          session_id: authState.sessid
        }
      })
    } catch (error) {
      console.error('Logout API call failed:', error)
    }
  }

  // Clear auth store
  authStore.set({
    sessid: null,
    atoken: null,
    atokenexp: null,
    rtoken: null,
    rtokenexp: null,
    remember: false
  })
}

/**
 * Get user sessions
 *
 * @returns Promise that resolves with user sessions
 */
export async function getUserSessions(): Promise<
  Array<{
    session_id: string
    ip_address: string
    device_info: string
    last_activity_at: number
    expires_at: number
    created_at: number
  }>
> {
  const response = await fetcher<{
    success: boolean
    data: {
      sessions: Array<{
        session_id: string
        ip_address: string
        device_info: string
        last_activity_at: number
        expires_at: number
        created_at: number
      }>
    }
  }>('/auth/sessions')

  if (response.success && response.data) {
    return response.data.sessions
  }

  return []
}

/**
 * Revoke a specific session
 *
 * @param sessionId - The session ID to revoke
 * @returns Promise that resolves when session is revoked
 */
export async function revokeSession(sessionId: string): Promise<boolean> {
  try {
    const response = await fetcher<{
      success: boolean
      data: null
    }>('/auth/sessions', {
      method: 'DELETE',
      body: {
        session_id: sessionId
      }
    })

    return response.success
  } catch (error) {
    console.error('Failed to revoke session:', error)
    return false
  }
}
