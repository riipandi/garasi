import { HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import {
  deactivateOtherSessions,
  revokeSessionRefreshTokens
} from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db, auth } = event.context

  try {
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
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    return { success: false, message, data: null, errors }
  }
})
