import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { deactivateAllSessions, revokeUserRefreshTokens } from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context

  const deactivatedCount = await deactivateAllSessions(db, auth.userId)

  const revokedCount = await revokeUserRefreshTokens(db, auth.userId)

  logger
    .withMetadata({ userId: auth.userId, deactivatedCount, revokedCount })
    .info('Signed out from all devices')

  return createResponse(
    event,
    `Signed out from all devices (${deactivatedCount} session(s) deactivated, ${revokedCount} token(s) revoked)`,
    {
      statusCode: 200,
      data: {
        deactivated_sessions: deactivatedCount,
        revoked_tokens: revokedCount
      }
    }
  )
})
