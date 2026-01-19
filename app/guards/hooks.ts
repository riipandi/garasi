import { useStore } from '@nanostores/react'
import { authStore } from '~/app/stores'
import { useAuthContext } from './context'

/**
 * Custom hook to access authentication state and methods.
 * Provides reactive access to auth state using nanostores.
 *
 * @returns AuthContextType object containing user, isAuthenticated, isLoading, login, and logout
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth()
 *
 *   if (isAuthenticated) {
 *     return <div>Welcome, {user?.name}! <button onClick={logout}>Logout</button></div>
 *   }
 *
 *   return <button onClick={() => login('user@example.com', 'password')}>Login</button>
 * }
 * ```
 */
export function useAuth() {
  // Get reactive auth state from nanostores
  const authState = useStore(authStore)

  // Get auth context methods (login, logout)
  const { login, logout } = useAuthContext()

  // Check if user is authenticated based on access token
  const isAuthenticated = !!authState?.accessToken

  // Create user object from auth state
  const user =
    isAuthenticated && authState?.userId
      ? {
          id: authState.userId,
          email: authState.userEmail || '',
          name: authState.userName || ''
        }
      : null

  return {
    user,
    isAuthenticated,
    isLoading: false,
    login,
    logout
  }
}
