import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { deactivateAllSessions } from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context

  const deactivatedCount = await deactivateAllSessions(db, auth.userId)

  logger.withMetadata({ userId: auth.userId, deactivatedCount }).info('Signed out from all devices')

  return createResponse(
    event,
    `Signed out from all devices (${deactivatedCount} session(s) deactivated)`,
    {
      statusCode: 200,
      data: {
        deactivated_sessions: deactivatedCount
      }
    }
  )
})
