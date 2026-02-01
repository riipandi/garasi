import { getCookie, HTTPError } from 'h3'
import pkg from '~/package.json' with { type: 'json' }
import { defineProtectedHandler } from '~/server/platform/guards'
import { clearCookie } from '~/server/platform/guards'
import { verifyRefreshToken } from '~/server/platform/jwt'
import { createResponse } from '~/server/platform/responder'
import { deactivateSession, revokeRefreshToken } from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context

  const refreshToken = getCookie(event, `${pkg.name}_rtoken`)

  if (!refreshToken) {
    logger.warn('Refresh token not found in cookies')
    throw new HTTPError({ status: 400, statusText: 'Refresh token is required' })
  }

  const payload = await verifyRefreshToken(refreshToken)

  if (!payload.sub) {
    logger.warn('Invalid refresh token payload')
    throw new HTTPError({ status: 401, statusText: 'Invalid refresh token payload' })
  }

  await revokeRefreshToken(db, refreshToken)

  await deactivateSession(db, auth.sessionId)

  logger
    .withMetadata({ userId: auth.userId, sessionId: auth.sessionId })
    .info('User logged out successfully')

  clearCookie(event, 'atoken')
  clearCookie(event, 'rtoken')
  clearCookie(event, 'sessid')

  return createResponse(event, 'Logged out successfully', {
    statusCode: 200,
    data: null
  })
})
