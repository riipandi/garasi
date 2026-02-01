import { useRouter } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { fetcher } from '~/app/fetcher'
import { logout as logoutApi } from '~/app/services/auth.service'
import { authStore } from '~/app/stores'
import type { User } from '~/shared/schemas/user.schema'
import { AuthContext, type AuthContextType } from './context'
import { onSessionExpired } from './procedures'

/**
 * AuthProvider component that provides authentication state and methods
 * to all child components using the existing authStore for persistence.
 * User information is fetched from /auth/whoami endpoint.
 */
export function AuthProvider({ children }: React.PropsWithChildren) {
  const router = useRouter()

  // Get current auth state from store
  const authState = authStore.get()

  // Check if user is authenticated based on access token
  const isAuthenticated = !!authState?.atoken

  // Store user data fetched from /auth/whoami endpoint
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)

  /**
   * Fetch user information from /auth/whoami endpoint
   */
  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetcher<{
        status: 'success' | 'error'
        message: string
        data: {
          user_id: string
          email: string
          name: string
        } | null
        error: any
      }>('/auth/whoami')

      if (response.status === 'success' && response.data) {
        return {
          id: response.data.user_id,
          email: response.data.email,
          name: response.data.name
        }
      }
      return null
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      return null
    }
  }, [])

  // Fetch user data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true)
      fetchUser().then((userData) => {
        setUser(userData)
        setIsLoading(false)
      })
    } else {
      setUser(null)
    }
  }, [isAuthenticated, fetchUser])

  // Listen to session expired events and redirect to signin
  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      setSessionExpired(true)
      setUser(null)
      // Redirect to signin after a short delay to show the session expired message
      setTimeout(() => {
        router.navigate({
          to: '/signin',
          search: { redirect: window.location.pathname + window.location.search }
        })
      }, 2000)
    })

    return unsubscribe
  }, [router])

  /**
   * Login function with API authentication
   * @param email - User email
   * @param password - User password
   * @returns Promise with success status and optional error message
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetcher<{
        status: 'success' | 'error'
        message: string
        data: {
          user_id: string
          email: string
          name: string
          session_id: string
          access_token: string
          refresh_token: string
          access_token_expiry: number | null
          refresh_token_expiry: number | null
        } | null
        error: any
      }>('/auth/signin', {
        method: 'POST',
        body: { email, password }
      })

      if (response.status !== 'success' || !response.data) {
        return { success: false, error: response.message || 'Invalid email or password' }
      }

      authStore.setKey('atoken', response.data.access_token)
      authStore.setKey('atokenexp', response.data.access_token_expiry)
      authStore.setKey('rtoken', response.data.refresh_token)
      authStore.setKey('rtokenexp', response.data.refresh_token_expiry)

      return { success: true }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Login failed'
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Logout function that clears authentication state and calls logout API
   */
  const logout = async (): Promise<void> => {
    await logoutApi() // Call logout API to revoke refresh token and deactivate session
    setUser(null) // Clear user state
  }

  /**
   * Dismiss session expired notification
   */
  const dismissSessionExpired = () => {
    setSessionExpired(false)
  }

  /**
   * Refetch user data from /auth/whoami endpoint
   * Useful after updating user profile
   */
  const refetchUser = async (): Promise<void> => {
    const userData = await fetchUser()
    setUser(userData)
  }

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    sessionExpired,
    dismissSessionExpired,
    login,
    logout,
    refetchUser
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
