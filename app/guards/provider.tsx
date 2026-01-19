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
      const response = await fetcher<{
        success: boolean
        message: string | null
        data: {
          user_id: string
          email: string
          name: string
          access_token: string
          refresh_token: string
          access_token_expiry: number | null
          refresh_token_expiry: number | null
        }
      }>('/auth/signin', {
        method: 'POST',
        body: { email, password }
      })

      if (!response.success || !response.data) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Use session ID from user_id
      const sessionId = String(response.data.user_id)

      // Set expiry times (access token: 1 hour, refresh token: 7 days)
      const now = Date.now()
      const accessTokenExpiry = response.data.access_token_expiry || now + 60 * 60 * 1000 // 1 hour
      const refreshTokenExpiry = response.data.refresh_token_expiry || now + 7 * 24 * 60 * 60 * 1000 // 7 days

      // Update auth store with user data and tokens from backend
      authStore.setKey('sessionId', sessionId)
      authStore.setKey('userId', response.data.user_id)
      authStore.setKey('userEmail', response.data.email)
      authStore.setKey('userName', response.data.name)
      authStore.setKey('accessToken', response.data.access_token)
      authStore.setKey('accessTokenExpiry', accessTokenExpiry)
      authStore.setKey('refreshToken', response.data.refresh_token)
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
