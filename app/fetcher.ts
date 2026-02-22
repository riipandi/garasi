import { ofetch, type $Fetch, type FetchOptions } from 'ofetch'
import { toast } from '~/app/components/toast'
import { isTokenExpired } from '~/app/guards'
import { authStore } from '~/app/stores'

let hasShownSessionExpiredToast = false
let isCleared = false

export function clearAuthState() {
  if (isCleared) return
  isCleared = true

  authStore.set({
    token: null,
    expiry: null,
    session: null
  })
}

export function resetAuthClearedFlag() {
  isCleared = false
  hasShownSessionExpiredToast = false
}

function showSessionExpiredToast() {
  if (!hasShownSessionExpiredToast) {
    hasShownSessionExpiredToast = true
    toast.add({
      title: 'Session Expired',
      description: 'Your session has expired. Please sign in again.',
      type: 'warning',
      timeout: 6000
    })
  }
}

function createFetcher(baseUrl: string, options: FetchOptions = {}): $Fetch {
  const baseFetcher = ofetch.create({
    baseURL: baseUrl,
    ...options,
    async onRequest({ options }) {
      const authState = authStore.get()

      if (authState?.token) {
        if (isTokenExpired(authState.expiry, 0)) {
          showSessionExpiredToast()
          clearAuthState()
          return
        }

        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${authState.token}`)
        options.headers = headers
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        showSessionExpiredToast()
        clearAuthState()
      }
    }
  })

  return (async (url, opts = {}) => {
    try {
      return await baseFetcher(url, opts)
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.response?.status || 500
      const message = error?.message || error?.statusMessage || 'An error occurred'

      if (statusCode === 401) {
        showSessionExpiredToast()
        clearAuthState()
      }

      return {
        status: 'error',
        message,
        data: null,
        error: { statusCode, reason: message },
        metadata: { request_id: '' }
      }
    }
  }) as $Fetch
}

const fetcher = createFetcher('/api')

export { createFetcher, fetcher }
