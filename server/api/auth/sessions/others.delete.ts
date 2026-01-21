import { defineProtectedHandler } from '~/server/platform/guards'
import { deactivateOtherSessions } from '~/server/services/session.service'
import { revokeSessionRefreshTokens } from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db, auth } = event.context

  // Deactivate all other sessions for the user
  const deactivatedCount = await deactivateOtherSessions(db, auth.userId, auth.sessionId)

  // Get all sessions for the user to find the ones we just deactivated
  const allSessions = await db
    .selectFrom('sessions')
    .select(['id'])
    .where('userId', '=', auth.userId)
    .where('id', '!=', auth.sessionId)
    .where('isActive', '=', 0)
    .execute()

  // Revoke refresh tokens for all deactivated sessions
  for (const session of allSessions) {
    await revokeSessionRefreshTokens(db, session.id)
  }

  // Return success message
  return {
    success: true,
    message: `Signed out from ${deactivatedCount} other device(s)`,
    data: {
      deactivated_count: deactivatedCount
    }
  }
})
