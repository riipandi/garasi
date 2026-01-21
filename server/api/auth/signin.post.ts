import { defineHandler, getRequestIP, HTTPError, readBody } from 'nitro/h3'
import { generateTokenPair } from '~/server/platform/jwt'
import {
  createSession,
  storeRefreshToken,
  cleanupExpiredSessions,
  cleanupExpiredRefreshTokens
} from '~/server/services/session.service'
import { parseUserAgent } from '~/server/utils/parser'

export default defineHandler(async (event) => {
  const { db, logger } = event.context

  try {
    // Parse and validate request body
    const body = await readBody<{ email: string; password: string }>(event)
    if (!body?.email || !body?.password) {
      logger.debug('Email and password are required')
      throw new HTTPError({ status: 400, statusText: 'Email and password are required' })
    }

    // Find user by email
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'passwordHash'])
      .where('email', '=', body.email)
      .executeTakeFirst()

    // Check if user exists
    if (!user) {
      logger.withMetadata({ email: body.email }).debug('User not found')
      throw new HTTPError({ status: 401, statusText: 'Invalid email or password' })
    }

    // Verify password using Bun's password.verify
    const isPasswordValid = await Bun.password.verify(body.password, user.passwordHash)
    if (!isPasswordValid) {
      logger.withMetadata({ email: body.email }).debug('Password validation failed')
      throw new HTTPError({ status: 401, statusText: 'Invalid email or password' })
    }

    // Get user agent and IP address from request
    const userAgent = parseUserAgent(event, { format: 'raw' })
    const ipAddress = getRequestIP(event, { xForwardedFor: true }) || 'unknown-ip'

    // Create a new session in the database first
    const { sessionId, sessionRecord } = await createSession(db, user.id, ipAddress, userAgent)

    if (!sessionId || !sessionRecord) {
      logger.withMetadata({ sessionId, sessionRecord }).debug('Failed to create session')
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
      logger.withError(error).error('Error cleaning up sessions')
    )

    // Cleanup expired refresh tokens
    cleanupExpiredRefreshTokens(db).catch((error) =>
      logger.withError(error).error('Error cleaning up refresh tokens')
    )

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
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    return { success: false, message, data: null, errors }
  }
})
