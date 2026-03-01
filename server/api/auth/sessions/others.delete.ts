import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { deactivateOtherSessions } from '~/server/services/session.service'
import type { RevokeOtherSessionsResponse } from '~/shared/schemas/user.schema'

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context

  logger
    .withMetadata({ userId: auth.userId, currentSessionId: auth.sessionId })
    .debug('Signing out from other devices')

  const deactivatedCount = await deactivateOtherSessions(db, auth.userId, auth.sessionId)

  logger
    .withMetadata({ userId: auth.userId, deactivatedCount })
    .info('Signed out from other devices')

  return createResponse<RevokeOtherSessionsResponse>(
    event,
    `Signed out from ${deactivatedCount} other device(s)`,
    {
      statusCode: 200,
      data: { deactivated_count: deactivatedCount }
    }
  )
})
