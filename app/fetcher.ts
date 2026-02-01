import { ofetch, type $Fetch, type FetchOptions } from 'ofetch'
import { toast } from '~/app/components/toast'
import { isTokenExpired, refreshAccessToken } from '~/app/guards'
import { authStore } from '~/app/stores'

/**
 * Prevents multiple simultaneous token refresh requests.
 * All concurrent requests wait for the same refresh promise.
 */
let isRefreshing = false
let refreshPromise: Promise<any> | null = null

/**
 * HTTP client with automatic Bearer token authentication and token refresh.
 *
 * @param baseUrl - Base URL for all requests (e.g., '/api' or 'https://api.example.com')
 * @param options - Additional ofetch configuration options
 * @returns Configured ofetch instance with auth interceptor
 *
 * @remarks
 * Token refresh flow:
 * 1. Check if access token is expired before request
 * 2. If expired, wait for in-progress refresh or start new one
 * 3. Use refreshed token for the request
 * 4. On 401 error, clear auth state
 *
 * @example
 * ```tsx
 * const api = createFetcher('https://api.example.com')
 * const users = await api('/users')
 * const newUser = await api('/users', {
 *   method: 'POST',
 *   body: { name: 'John', email: 'john@example.com' }
 * })
 * ```
 */
function createFetcher(baseUrl: string, options: FetchOptions = {}): $Fetch {
  return ofetch.create({
    baseURL: baseUrl,
    ...options,
    /**
     * Request interceptor - adds Bearer token and handles refresh.
     */
    async onRequest({ options }) {
      const authState = authStore.get()

      if (authState?.atoken && authState?.rtoken) {
        if (isTokenExpired(authState.atokenexp)) {
          try {
            // Wait for in-progress refresh or start new one
            if (isRefreshing && refreshPromise) {
              await refreshPromise
            } else {
              isRefreshing = true
              refreshPromise = refreshAccessToken(authState.rtoken)
              await refreshPromise
              isRefreshing = false
              refreshPromise = null
            }

            // Use refreshed token
            const updatedAuthState = authStore.get()
            if (updatedAuthState?.atoken) {
              options.headers = new Headers(options.headers)
              options.headers.set('Authorization', `Bearer ${updatedAuthState.atoken}`)
            }
          } catch (error) {
            // Clear auth state on refresh failure
            isRefreshing = false
            refreshPromise = null
            authStore.set({
              atoken: null,
              atokenexp: null,
              rtoken: null,
              rtokenexp: null,
              remember: false
            })
            throw error
          }
        } else {
          // Token is valid, use it directly
          options.headers = new Headers(options.headers)
          options.headers.set('Authorization', `Bearer ${authState.atoken}`)
        }
      }
    },
    /**
     * Response error interceptor - clears auth state on 401.
     */
    onResponseError({ response }) {
      if (response.status === 401) {
        // Show user-friendly notification before clearing auth
        toast.add({
          title: 'Authentication Required',
          description: 'Your session has expired. Please sign in again.',
          type: 'warning',
          timeout: 6000
        })

        // Clear auth state
        authStore.set({
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
 * Default fetcher instance for API requests (base URL: `/api`).
 *
 * Automatically handles Bearer token injection, token refresh, and 401 errors.
 *
 * @example
 * ```tsx
 * import { fetcher } from '~/app/fetcher'
 *
 * // GET request
 * const users = await fetcher('/users')
 *
 * // POST request
 * const newUser = await fetcher('/users', {
 *   method: 'POST',
 *   body: { name: 'John' }
 * })
 *
 * // With TypeScript generics
 * interface User { id: string; name: string }
 * const user = await fetcher<User>('/users/1')
 * ```
 */
const fetcher = createFetcher('/api')

export { createFetcher, fetcher }
