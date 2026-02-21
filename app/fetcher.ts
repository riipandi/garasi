import { ofetch, type $Fetch, type FetchOptions } from 'ofetch'
import { toast } from '~/app/components/toast'
import { isTokenExpired, isRefreshTokenExpired, refreshAccessToken } from '~/app/guards'
import { authStore } from '~/app/stores'

type RefreshResult = {
  access_token: string
  refresh_token: string
  access_token_expiry: number
  refresh_token_expiry: number
  sessid: string
} | null

let isRefreshing = false
let refreshPromise: Promise<RefreshResult> | null = null
let hasShownSessionExpiredToast = false
let isCleared = false

export function clearAuthState() {
  if (isCleared) return
  isCleared = true

  authStore.set({
    atoken: null,
    atokenexp: null,
    rtoken: null,
    rtokenexp: null,
    sessid: null,
    remember: false
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

      if (authState?.atoken && authState?.rtoken) {
        if (isTokenExpired(authState.atokenexp)) {
          if (isRefreshTokenExpired(authState.rtokenexp)) {
            showSessionExpiredToast()
            clearAuthState()
            return
          }

          try {
            if (isRefreshing && refreshPromise) {
              await refreshPromise
            } else {
              isRefreshing = true
              refreshPromise = refreshAccessToken()
              await refreshPromise
              isRefreshing = false
              refreshPromise = null
            }

            const updatedAuthState = authStore.get()
            if (updatedAuthState?.atoken) {
              options.headers = new Headers(options.headers)
              options.headers.set('Authorization', `Bearer ${updatedAuthState.atoken}`)
            } else {
              showSessionExpiredToast()
              clearAuthState()
              return
            }
          } catch {
            isRefreshing = false
            refreshPromise = null
            showSessionExpiredToast()
            clearAuthState()
            return
          }
        } else {
          options.headers = new Headers(options.headers)
          options.headers.set('Authorization', `Bearer ${authState.atoken}`)
        }
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
