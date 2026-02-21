import { readBody, defineHandler, getRequestIP, HTTPError } from 'nitro/h3'
import { storeCookie } from '~/server/platform/guards'
import { generateToken } from '~/server/platform/jwt'
import { createResponse, createErrorResonse } from '~/server/platform/responder'
import { createSession } from '~/server/services/session.service'
import { cleanupExpiredSessions } from '~/server/services/session.service'
import { parseUserAgent } from '~/server/utils/parser'
import { protectedEnv } from '~/shared/envars'

export default defineHandler(async (event) => {
  const { db, logger } = event.context

  try {
    const body = await readBody<{ email: string; password: string }>(event)
    if (!body?.email || !body?.password) {
      logger.warn('Email and password are required')
      throw new HTTPError({ status: 400, statusText: 'Email and password are required' })
    }
    const { email, password } = body

    logger.withMetadata({ email }).debug('Attempting user sign in')

    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'passwordHash'])
      .where('email', '=', email)
      .executeTakeFirst()

    if (!user) {
      logger.withMetadata({ email }).warn('User not found')
      throw new HTTPError({ status: 401, statusText: 'Invalid email or password' })
    }

    const isPasswordValid = await Bun.password.verify(password, user.passwordHash)
    if (!isPasswordValid) {
      logger.withMetadata({ email }).warn('Password validation failed')
      throw new HTTPError({ status: 401, statusText: 'Invalid email or password' })
    }

    logger.withMetadata({ email, userId: user.id }).debug('User authenticated, creating session')

    const userAgent = parseUserAgent(event, { format: 'raw' })
    const ipAddress = getRequestIP(event, { xForwardedFor: true }) || 'unknown-ip'

    const { sessionId, sessionRecord } = await createSession(db, user.id, ipAddress, userAgent)

    if (!sessionId || !sessionRecord) {
      logger.withMetadata({ userId: user.id }).error('Failed to create session')
      throw new HTTPError({ status: 500, statusText: 'Failed to create session' })
    }

    const { token, tokenExpiry } = await generateToken(user.id, sessionId, userAgent)

    cleanupExpiredSessions(db).catch((error) =>
      logger.withError(error).error('Error cleaning up expired sessions')
    )

    storeCookie(event, 'token', token, protectedEnv.PUBLIC_JWT_ACCESS_TOKEN_EXPIRY)
    storeCookie(event, 'sessid', sessionId, protectedEnv.PUBLIC_JWT_ACCESS_TOKEN_EXPIRY)

    logger.withMetadata({ userId: user.id, sessionId }).info('User signed in successfully')

    return createResponse(event, 'Signed in successfully', {
      statusCode: 200,
      data: {
        user_id: user.id,
        email: user.email,
        name: user.name,
        session_id: sessionId,
        access_token: token,
        access_token_expiry: tokenExpiry
      }
    })
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
