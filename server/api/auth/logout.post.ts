import { defineProtectedHandler } from '~/server/platform/guards'
import { clearCookie } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { deactivateSession } from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context

  await deactivateSession(db, auth.sessionId)

  logger
    .withMetadata({ userId: auth.userId, sessionId: auth.sessionId })
    .info('User logged out successfully')

  clearCookie(event, 'token')
  clearCookie(event, 'sessid')

  return createResponse(event, 'Logged out successfully', {
    statusCode: 200,
    data: null
  })
})
