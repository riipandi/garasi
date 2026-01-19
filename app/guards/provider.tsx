import { fetcher } from '~/app/fetcher'
import { authStore } from '~/app/stores'
import type { User } from '~/shared/schemas/user.schema'
import { AuthContext, type AuthContextType } from './context'

/**
 * AuthProvider component that provides authentication state and methods
 * to all child components using the existing authStore for persistence.
 */
export function AuthProvider({ children }: React.PropsWithChildren) {
  // Get current auth state from store
  const authState = authStore.get()

  // Check if user is authenticated based on access token
  const isAuthenticated = !!authState?.accessToken

  // Create user object from auth state
  const user: User | null =
    isAuthenticated && authState?.userId
      ? {
          id: authState.userId,
          email: authState.userEmail || '',
          name: authState.userName || ''
        }
      : null

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
      // Call the signin API endpoint
      const response = await fetcher<{ success: boolean; user: User }>('/auth/signin', {
        method: 'POST',
        body: { email, password }
      })

      if (!response.success || !response.user) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Generate session and tokens (in a real app, these would come from the backend)
      const sessionId = String(response.user.id)
      const accessToken = `access_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const refreshToken = `refresh_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

      // Set expiry times (access token: 1 hour, refresh token: 7 days)
      const now = Date.now()
      const accessTokenExpiry = now + 60 * 60 * 1000 // 1 hour
      const refreshTokenExpiry = now + 7 * 24 * 60 * 60 * 1000 // 7 days

      // Update auth store with user data and tokens
      authStore.setKey('sessionId', sessionId)
      authStore.setKey('userId', response.user.id)
      authStore.setKey('userEmail', response.user.email)
      authStore.setKey('userName', response.user.name)
      authStore.setKey('accessToken', accessToken)
      authStore.setKey('accessTokenExpiry', accessTokenExpiry)
      authStore.setKey('refreshToken', refreshToken)
      authStore.setKey('refreshTokenExpiry', refreshTokenExpiry)

      return { success: true }
    } catch (error: any) {
      // Handle API errors
      const errorMessage = error?.data?.message || error?.message || 'Login failed'
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Logout function that clears authentication state
   */
  const logout = async (): Promise<void> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Clear auth store
    authStore.set({
      sessionId: null,
      accessToken: null,
      accessTokenExpiry: null,
      refreshToken: null,
      refreshTokenExpiry: null,
      remember: false,
      userId: null,
      userEmail: null,
      userName: null
    })
  }

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: false,
    login,
    logout
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
