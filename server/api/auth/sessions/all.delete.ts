import { defineProtectedHandler } from '~/server/platform/guards'
import { createErrorResonse } from '~/server/platform/responder'
import { deactivateAllSessions, revokeUserRefreshTokens } from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db, auth } = event.context

  try {
    // Deactivate all sessions for the user
    const deactivatedCount = await deactivateAllSessions(db, auth.userId)

    // Revoke all refresh tokens for the user
    const revokedCount = await revokeUserRefreshTokens(db, auth.userId)

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
    return createErrorResonse(event, error)
  }
})
