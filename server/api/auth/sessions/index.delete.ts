import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { deactivateSession } from '~/server/services/session.service'
import type { RevokeSessionResponse } from '~/shared/schemas/user.schema'

export default defineProtectedHandler(async (event) => {
  const { db, logger } = event.context

  const body = await readBody<{ session_id: string }>(event)

  if (!body?.session_id) {
    logger.warn('Session ID is required')
    throw new HTTPError({ status: 400, statusText: 'Session ID is required' })
  }

  logger.withMetadata({ sessionId: body.session_id }).debug('Revoking session')

  const deactivatedCount = await deactivateSession(db, body.session_id)

  if (deactivatedCount === 0) {
    logger.withMetadata({ sessionId: body.session_id }).warn('Session not found')
    throw new HTTPError({ status: 404, statusText: 'Session not found' })
  }

  logger.withMetadata({ sessionId: body.session_id }).info('Session revoked successfully')

  return createResponse<RevokeSessionResponse>(event, 'Session revoked successfully', {
    statusCode: 200,
    data: { session_id: body.session_id }
  })
})
