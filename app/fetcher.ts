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

function clearAuthAndRedirect() {
  authStore.set({
    atoken: null,
    atokenexp: null,
    rtoken: null,
    rtokenexp: null,
    sessid: null,
    remember: false
  })

  const currentPath = window.location.pathname
  if (currentPath !== '/signin') {
    setTimeout(() => {
      hasShownSessionExpiredToast = false
    }, 1000)
    window.location.href = `/signin?redirect=${encodeURIComponent(currentPath)}`
  }
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
            clearAuthAndRedirect()

            ;(options as any)._cancelled = true
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
              clearAuthAndRedirect()

              ;(options as any)._cancelled = true
              return
            }
          } catch {
            isRefreshing = false
            refreshPromise = null
            showSessionExpiredToast()
            clearAuthAndRedirect()

            ;(options as any)._cancelled = true
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
        clearAuthAndRedirect()
      }
    }
  })

  return (async (url, opts = {}) => {
    if ((opts as any)._cancelled) {
      return {
        status: 'error',
        message: 'Session expired. Please sign in again.',
        data: null,
        error: { statusCode: 401, reason: 'Session expired' },
        metadata: { request_id: '' }
      }
    }

    try {
      return await baseFetcher(url, opts)
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.response?.status || 500
      const message = error?.message || error?.statusMessage || 'An error occurred'

      if (statusCode === 401) {
        showSessionExpiredToast()
        clearAuthAndRedirect()
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

export function resetSessionExpiredFlag() {
  hasShownSessionExpiredToast = false
}

export { createFetcher, fetcher }
