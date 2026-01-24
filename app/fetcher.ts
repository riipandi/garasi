import { ofetch, type FetchOptions, type MappedResponseType, type ResponseType } from 'ofetch'
import { extractSessionIdFromToken } from '~/app/guards'
import { authStore } from '~/app/stores'

/**
 * Fetch options for the API client
 *
 * This interface extends the standard ofetch FetchOptions but provides
 * type-safe method options for HTTP requests.
 *
 * @property method - HTTP method to use for the request
 * @property baseURL - Base URL for all requests (used in createFetcher)
 * @property headers - Request headers
 * @property query - URL query parameters
 * @property body - Request body for POST/PUT/PATCH requests
 * @property timeout - Request timeout in milliseconds
 * @property retry - Retry configuration for failed requests
 *
 * @example
 * ```tsx
 * import  fetcher  from '~/app/fetcher'
 *
 * // GET request with query parameters
 * const users = await fetcher('/users', {
 *   method: 'GET',
 *   query: { page: 1, limit: 10 }
 * })
 *
 * // POST request with body
 * const newUser = await fetcher('/users', {
 *   method: 'POST',
 *   body: { name: 'John', email: 'john@example.com' }
 * })
 *
 * // PUT request with headers
 * const updatedUser = await fetcher('/users/1', {
 *   method: 'PUT',
 *   headers: { 'X-Custom-Header': 'value' },
 *   body: { name: 'John Updated' }
 * })
 *
 * // DELETE request
 * await fetcher('/users/1', { method: 'DELETE' })
 * ```
 */
export interface FetcherOptions extends Omit<FetchOptions, 'method'> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
}

/**
 * Type-safe fetcher function with custom options
 * Compatible with $Fetch from ofetch but uses FetcherOptions for type safety
 */
export type Fetcher = <T = any, R extends ResponseType = 'json'>(
  request: string,
  options?: FetcherOptions
) => Promise<MappedResponseType<R, T>>

/**
 * Create a fetcher instance with Bearer token interceptor and automatic token refresh
 *
 * This wrapper automatically adds Authorization header with Bearer token header
 * from auth store to all requests. It also handles automatic token refresh when
 * access token expires.
 *
 * @param options - Additional fetch options (must include baseURL)
 * @returns A configured ofetch instance compatible with $Fetch
 *
 * @example
 * ```tsx
 * const api = createFetcher({ baseURL: 'https://api.example.com' })
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
export function createFetcher(options: FetcherOptions = {}): Fetcher {
  const instance = ofetch.create({
    baseURL: options.baseURL,
    ...options,
    async onRequest({ options }) {
      // Get current auth state from store
      const authState = authStore.get()

      // Check if access token is expired or will expire soon
      if (authState?.atoken && authState?.rtoken) {
        if (isTokenExpired(authState.atokenexp)) {
          // If already refreshing, wait for existing refresh to complete
          if (isRefreshing && refreshPromise) {
            const refreshResult = await refreshPromise
            if (!refreshResult) {
              // Refresh failed, clear auth and redirect
              handleSessionExpired()
              return
            }
          } else {
            // Start a new refresh
            isRefreshing = true
            refreshPromise = refreshAccessToken(authState.rtoken)
            const refreshResult = await refreshPromise
            isRefreshing = false
            refreshPromise = null

            if (!refreshResult) {
              // Refresh failed, clear auth and redirect
              handleSessionExpired()
              return
            }
          }

          // Get updated auth state after refresh
          const updatedAuthState = authStore.get()
          if (updatedAuthState?.atoken) {
            options.headers = new Headers(options.headers)
            options.headers.set('Authorization', `Bearer ${updatedAuthState.atoken}`)
          } else {
            // No valid token after refresh, handle session expired
            handleSessionExpired()
            return
          }
        } else {
          // Add Bearer token if access token exists and is valid
          options.headers = new Headers(options.headers)
          options.headers.set('Authorization', `Bearer ${authState.atoken}`)
        }
      }
    },
    onResponseError({ response }) {
      // Handle 401 Unauthorized errors
      if (response.status === 401) {
        handleSessionExpired()
      }
    }
  })

  // Return a typed wrapper function without type assertion
  return <T = any, R extends ResponseType = 'json'>(
    request: string,
    fetchOptions?: FetcherOptions
  ): Promise<MappedResponseType<R, T>> => {
    return instance<T, R>(request, fetchOptions as RequestInit)
  }
}

/**
 * Refresh access token using refresh token
 *
 * @param refreshToken - The refresh token to use
 * @returns New tokens or null if refresh failed
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  access_token_expiry: number
  refresh_token_expiry: number
  sid: string
} | null> {
  try {
    const response = await fetcher<{
      success: boolean
      data: {
        access_token: string
        refresh_token: string
        access_token_expiry: number
        refresh_token_expiry: number
        sid: string
      }
    }>('/auth/refresh', {
      method: 'POST',
      body: {
        refresh_token: refreshToken,
        session_id: extractSessionIdFromToken(refreshToken) || ''
      }
    })

    if (response.success && response.data) {
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

function notifySessionExpired() {
  sessionExpiredListeners.forEach((listener) => {
    try {
      listener()
    } catch (error) {
      console.error('Error in session expired listener:', error)
    }
  })
}

/**
 * Handle session expired by clearing auth store and notifying listeners
 */
function handleSessionExpired() {
  // Clear auth store
  authStore.set({
    atoken: null,
    atokenexp: null,
    rtoken: null,
    rtokenexp: null,
    remember: false
  })

  // Notify all listeners about session expiry
  notifySessionExpired()
}

/**
 * Default fetcher instance for API requests
 * Can be used directly or as a base for creating new fetchers
 *
 * @example
 * ```tsx
 * import  fetcher  from '~/app/fetcher'
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
export const fetcher = createFetcher({ baseURL: '/api' })

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
