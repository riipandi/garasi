import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { deactivateSession, revokeSessionRefreshTokens } from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db, logger } = event.context

  // Parse request body
  const body = await readBody<{ session_id: string }>(event)

  // Validate required fields
  if (!body?.session_id) {
    logger.warn('Session ID is required')
    throw new HTTPError({ status: 400, statusText: 'Session ID is required' })
  }

  logger.withMetadata({ sessionId: body.session_id }).debug('Revoking session')

  // Deactivate the session
  const deactivatedCount = await deactivateSession(db, body.session_id)

  if (deactivatedCount === 0) {
    logger.withMetadata({ sessionId: body.session_id }).warn('Session not found')
    throw new HTTPError({ status: 404, statusText: 'Session not found' })
  }

  // Revoke all refresh tokens for this session
  await revokeSessionRefreshTokens(db, body.session_id)

  logger.withMetadata({ sessionId: body.session_id }).info('Session revoked successfully')

  // Return success message
  return {
    success: true,
    message: 'Session revoked successfully',
    data: null
  }
})
