import { readBody, defineHandler, getRequestIP, HTTPError } from 'nitro/h3'
import { storeCookie } from '~/server/platform/guards'
import { generateTokenPair } from '~/server/platform/jwt'
import { createErrorResonse } from '~/server/platform/responder'
import { createSession, storeRefreshToken } from '~/server/services/session.service'
import { cleanupExpiredSessions } from '~/server/services/session.service'
import { cleanupExpiredRefreshTokens } from '~/server/services/session.service'
import { parseUserAgent } from '~/server/utils/parser'
import { protectedEnv } from '~/shared/envars'

// TODO: add optional signin with `accessKeyId` and `secretAccessKey`
// When enable, this only allow to manage the related bucket (file manager)

export default defineHandler(async (event) => {
  const { db, logger } = event.context

  try {
    // Parse and validate request body
    const body = await readBody<{ email: string; password: string }>(event)
    if (!body?.email || !body?.password) {
      logger.warn('Email and password are required')
      throw new HTTPError({ status: 400, statusText: 'Email and password are required' })
    }
    const { email, password } = body

    logger.withMetadata({ email }).debug('Attempting user sign in')

    // Find user by email
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'passwordHash'])
      .where('email', '=', email)
      .executeTakeFirst()

    // Check if user exists
    if (!user) {
      logger.withMetadata({ email }).warn('User not found')
      throw new HTTPError({ status: 401, statusText: 'Invalid email or password' })
    }

    // Verify password using Bun's password.verify
    const isPasswordValid = await Bun.password.verify(password, user.passwordHash)
    if (!isPasswordValid) {
      logger.withMetadata({ email }).warn('Password validation failed')
      throw new HTTPError({ status: 401, statusText: 'Invalid email or password' })
    }

    logger.withMetadata({ email, userId: user.id }).debug('User authenticated, creating session')

    // Get user agent and IP address from request
    const userAgent = parseUserAgent(event, { format: 'raw' })
    const ipAddress = getRequestIP(event, { xForwardedFor: true }) || 'unknown-ip'

    // Create a new session in the database first
    const { sessionId, sessionRecord } = await createSession(db, user.id, ipAddress, userAgent)

    if (!sessionId || !sessionRecord) {
      logger.withMetadata({ userId: user.id }).error('Failed to create session')
      throw new HTTPError({ status: 500, statusText: 'Failed to create session' })
    }

    // Generate JWT tokens with user agent hash and session ID
    const tokens = await generateTokenPair({ userId: user.id, sessionId }, userAgent)

    // Store the refresh token in the database
    await storeRefreshToken(
      db,
      user.id,
      sessionRecord.id,
      tokens.refreshToken,
      tokens.refreshTokenExpiry
    )

    // Clean up expired sessions
    cleanupExpiredSessions(db).catch((error) =>
      logger.withError(error).error('Error cleaning up expired sessions')
    )

    // Cleanup expired refresh tokens
    cleanupExpiredRefreshTokens(db).catch((error) =>
      logger.withError(error).error('Error cleaning up expired refresh tokens')
    )

    // Store accessToken, refreshToken, and sessionId on cookie
    storeCookie(event, 'atoken', tokens.accessToken, protectedEnv.PUBLIC_JWT_ACCESS_TOKEN_EXPIRY)
    storeCookie(event, 'rtoken', tokens.refreshToken, protectedEnv.PUBLIC_JWT_REFRESH_TOKEN_EXPIRY)
    storeCookie(event, 'sessid', sessionId, protectedEnv.PUBLIC_JWT_ACCESS_TOKEN_EXPIRY)

    logger.withMetadata({ userId: user.id, sessionId }).info('User signed in successfully')

    // Return user data with JWT tokens and session info
    return {
      success: true,
      message: null,
      data: {
        user_id: user.id,
        email: user.email,
        name: user.name,
        session_id: sessionId,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        access_token_expiry: tokens.accessTokenExpiry,
        refresh_token_expiry: tokens.refreshTokenExpiry
      }
    }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
