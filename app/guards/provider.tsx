import { useStore } from '@nanostores/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from '~/app/components/toast'
import { resetAuthClearedFlag } from '~/app/fetcher'
import { clearAuthState } from '~/app/fetcher'
import authService from '~/app/services/auth.service'
import { authStore } from '~/app/stores'
import pkg from '~/package.json' with { type: 'json' }
import type { User } from '~/shared/schemas/user.schema'
import { AuthContext, type AuthContextType } from './context'

const STORAGE_KEY = `${pkg.name}_auth:`

export function AuthProvider({ children }: React.PropsWithChildren) {
  const authState = useStore(authStore)
  const isAuthenticated = !!authState?.atoken

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const previousAuthState = useRef<typeof authState>(null)
  const isLoggingOutRef = useRef(false)
  const isManualLogoutRef = useRef(false)

  const navigateTo = useCallback((to: string) => {
    window.location.href = to
  }, [])

  const performLogout = useCallback(
    async (showToast = false) => {
      if (isLoggingOutRef.current) return
      isLoggingOutRef.current = true

      clearAuthState()
      setUser(null)
      isLoggingOutRef.current = false

      if (showToast && !isManualLogoutRef.current) {
        toast.add({
          title: 'Signed Out',
          description: 'You have been signed out due to a session change, you need to login again.',
          type: 'info',
          timeout: 0,
          actionProps: {
            children: 'Login again',
            onClick: () => navigateTo('/signin')
          }
        })
      }
    },
    [navigateTo]
  )

  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await authService.whoami()

      if (response.status === 'success' && response.data) {
        return {
          id: response.data.user_id,
          email: response.data.email,
          name: response.data.name
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

      return null
    } catch (error: unknown) {
      console.error('Failed to fetch user info:', error)

      const err = error as { statusCode?: number; name?: string; statusMessage?: string }

      const isAuthError =
        err.statusCode === 401 ||
        err.statusCode === 403 ||
        err.name === 'FetchError' ||
        err.name === 'TypeError'

      if (isAuthError) {
        authStore.set({
          atoken: null,
          atokenexp: null,
          rtoken: null,
          rtokenexp: null,
          sessid: null,
          remember: false
        })

        if (!isManualLogoutRef.current) {
          toast.add({
            title: 'Session Invalid',
            description: 'Your session is no longer valid. Please sign in again.',
            type: 'warning',
            timeout: 0,
            actionProps: {
              children: 'Login again',
              onClick: () => navigateTo('/signin')
            }
          })
        }
      }

      return null
    }
  }, [navigateTo])

  const checkAuthUnexpectedChange = useCallback(
    (prev: typeof authState, current: typeof authState) => {
      if (!prev || !current) return false

      const wasAuthenticated = !!prev.atoken
      const isAuthenticatedNow = !!current.atoken

      if (wasAuthenticated && !isAuthenticatedNow) {
        return true
      }

      if (wasAuthenticated && isAuthenticatedNow) {
        const tokenCleared = prev.atoken !== current.atoken && current.atoken === null
        const sessionCleared = prev.sessid !== current.sessid && current.sessid === null

        if (tokenCleared || sessionCleared) {
          return true
        }
      }

      return false
    },
    []
  )

  useEffect(() => {
    let mounted = true

    const loadUserData = async () => {
      if (!mounted || !isAuthenticated) return

      try {
        setIsLoading(true)
        const userData = await fetchUser()
        if (mounted) {
          setUser(userData)
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadUserData()

    return () => {
      mounted = false
    }
  }, [isAuthenticated, fetchUser])

  useEffect(() => {
    const unsubscribe = authStore.subscribe((newState) => {
      const prev = previousAuthState.current
      previousAuthState.current = newState

      if (prev && checkAuthUnexpectedChange(prev, newState)) {
        if (!isManualLogoutRef.current) {
          performLogout(true)
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [checkAuthUnexpectedChange, performLogout])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key || !event.key.startsWith(STORAGE_KEY) || event.newValue === event.oldValue) {
        return
      }

      const currentAuth = authStore.get()
      const wasAuthenticated = !!currentAuth?.atoken

      if (!wasAuthenticated) return

      const storageKey = event.key.replace(STORAGE_KEY, '')

      if (storageKey === 'atoken' || storageKey === 'rtoken' || storageKey === 'sessid') {
        const newValue = event.newValue

        if (newValue === '' || newValue === null) {
          if (!isManualLogoutRef.current) {
            performLogout(true)
          }
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [performLogout])

  const login = async (
    email: string,
    password: string,
    remember: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.signin(email, password, remember)

      if (response.status !== 'success' || !response.data) {
        toast.add({
          title: 'Login Failed',
          description: response.message || 'Invalid email or password',
          type: 'error',
          timeout: 7000
        })
        return { success: false, error: response.message || 'Invalid email or password' }
      }

      const sessionData = response.data

      authStore.set({
        atoken: sessionData.access_token,
        atokenexp: sessionData.access_token_expiry,
        rtoken: sessionData.refresh_token,
        rtokenexp: sessionData.refresh_token_expiry,
        sessid: sessionData.session_id,
        remember
      })

      resetAuthClearedFlag()

      toast.add({
        title: 'Welcome back!',
        description: 'You have successfully signed in',
        type: 'success',
        timeout: 5000
      })

      return { success: true }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Login failed'
      toast.add({
        title: 'Login Failed',
        description: errorMessage,
        type: 'error',
        timeout: 7000
      })
      return { success: false, error: errorMessage }
    }
  }

  const logout = async (): Promise<void> => {
    isManualLogoutRef.current = true
    await performLogout(false)
    isManualLogoutRef.current = false
  }

  const refetchUser = async (): Promise<void> => {
    const userData = await fetchUser()
    setUser(userData)
  }

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refetchUser
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
