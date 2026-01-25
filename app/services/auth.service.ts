import fetcher from '~/app/fetcher'
import { extractSessionIdFromToken } from '~/app/guards'
import { authStore } from '~/app/stores'

/**
 * Logout function to clear auth state and call logout endpoint
 *
 * @returns Promise that resolves when logout is complete
 */
export async function logout(): Promise<void> {
  const authState = authStore.get()

  if (authState?.rtoken && authState?.atoken) {
    const sessionId = extractSessionIdFromToken(authState.atoken)
    if (sessionId) {
      try {
        // Call logout endpoint to revoke refresh token and deactivate session
        await fetcher('/auth/logout', {
          method: 'POST',
          body: {
            refresh_token: authState.rtoken,
            session_id: sessionId
          }
        })
      } catch (error) {
        console.error('Logout API call failed:', error)
      }
    }
  }

  // Clear auth store
  authStore.set({
    atoken: null,
    atokenexp: null,
    rtoken: null,
    rtokenexp: null,
    remember: false
  })
}
