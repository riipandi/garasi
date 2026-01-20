import type { $Fetch, FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'
import { authStore } from '~/app/stores'

/**
 * Create a fetcher instance with Bearer token interceptor
 *
 * This wrapper automatically adds the Authorization header with Bearer token
 * from the auth store to all requests.
 *
 * @param baseUrl - The base URL for all requests
 * @param options - Additional fetch options
 * @returns A configured ofetch instance
 *
 * @example
 * ```tsx
 * const api = createFetcher('https://api.example.com')
 *
 * // GET request - automatically adds Bearer token
 * const data = await api('/users')
 *
 * // POST request - automatically adds Bearer token
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
    onRequest({ options }) {
      // Get current auth state from store
      const authState = authStore.get()

      // Add Bearer token if access token exists
      if (authState?.atoken) {
        options.headers = new Headers(options.headers)
        options.headers.set('Authorization', `Bearer ${authState.atoken}`)
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
