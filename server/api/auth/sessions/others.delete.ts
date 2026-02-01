import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { deactivateOtherSessions } from '~/server/services/session.service'
import { revokeSessionRefreshTokens } from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context

  logger
    .withMetadata({ userId: auth.userId, currentSessionId: auth.sessionId })
    .debug('Signing out from other devices')

  const deactivatedCount = await deactivateOtherSessions(db, auth.userId, auth.sessionId)

  const allSessions = await db
    .selectFrom('sessions')
    .select(['id'])
    .where('userId', '=', auth.userId)
    .where('id', '!=', auth.sessionId)
    .where('isActive', '=', 0)
    .execute()

  for (const session of allSessions) {
    await revokeSessionRefreshTokens(db, session.id)
  }

  logger
    .withMetadata({ userId: auth.userId, deactivatedCount })
    .info('Signed out from other devices')

  return createResponse(event, `Signed out from ${deactivatedCount} other device(s)`, {
    statusCode: 200,
    data: {
      deactivated_count: deactivatedCount
    }
  })
})
