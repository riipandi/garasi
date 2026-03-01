import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { deactivateSession } from '~/server/services/session.service'
import type { LogoutResponse } from '~/shared/schemas/user.schema'

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context

  await deactivateSession(db, auth.sessionId)

  logger
    .withMetadata({ userId: auth.userId, sessionId: auth.sessionId })
    .info('User logged out successfully')

  return createResponse<LogoutResponse>(event, 'Logged out successfully', {
    statusCode: 200,
    data: { success: true }
  })
})
