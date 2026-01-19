import { createContext, useContext } from 'react'
import type { User } from '~/shared/schemas/user.schema'

// Auth context interface
export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

// Create auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Custom hook to use the AuthContext
 * @throws Error if used outside of AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
