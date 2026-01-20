import { HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { deactivateAllSessions, revokeUserRefreshTokens } from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db, auth } = event.context

  try {
    // Deactivate all sessions for the user
    const deactivatedCount = await deactivateAllSessions(db, String(auth.userId))

    // Revoke all refresh tokens for the user
    const revokedCount = await revokeUserRefreshTokens(db, String(auth.userId))

    // Return success message
    return {
      success: true,
      message: `Signed out from all devices (${deactivatedCount} session(s) deactivated, ${revokedCount} token(s) revoked)`,
      data: {
        deactivated_sessions: deactivatedCount,
        revoked_tokens: revokedCount
      }
    }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.cause : null
    return { success: false, message, data: null, errors }
  }
})
