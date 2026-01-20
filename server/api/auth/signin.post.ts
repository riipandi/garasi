import { defineHandler, HTTPError, readBody } from 'nitro/h3'
import { generateTokenPair } from '~/server/platform/jwt'
import {
  createSession,
  storeRefreshToken,
  cleanupExpiredSessions,
  cleanupExpiredRefreshTokens
} from '~/server/services/session.service'

export default defineHandler(async (event) => {
  const { db } = event.context

  try {
    // Parse request body
    const body = await readBody<{ email: string; password: string }>(event)

    // Validate required fields
    if (!body?.email || !body?.password) {
      throw new HTTPError({ status: 400, statusText: 'Email and password are required' })
    }

    // Find user by email
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'password_hash'])
      .where('email', '=', body.email)
      .executeTakeFirst()

    // Check if user exists
    if (!user) {
      throw new HTTPError({ status: 401, statusText: 'Invalid email or password' })
    }

    // Verify password using Bun's password.verify
    const isPasswordValid = await Bun.password.verify(body.password, user.password_hash)

    if (!isPasswordValid) {
      throw new HTTPError({ status: 401, statusText: 'Invalid email or password' })
    }

    // Get user agent and IP address from request
    const userAgent = event.req.headers.get('user-agent') || 'unknown'
    const ipAddress =
      event.req.headers.get('x-forwarded-for') || event.req.headers.get('x-real-ip') || 'unknown'

    // Generate JWT tokens with user agent hash
    const tokens = await generateTokenPair({ userId: String(user.id) }, userAgent)

    // Create a new session in the database
    const { sessionId, sessionRecord } = await createSession(db, user.id, ipAddress, userAgent)

    // Store the refresh token in the database
    await storeRefreshToken(
      db,
      user.id,
      sessionRecord.id,
      tokens.refreshToken,
      tokens.refreshTokenExpiry
    )

    // Clean up expired sessions and refresh tokens (background task)
    cleanupExpiredSessions(db).catch((err) => console.error('Error cleaning up sessions:', err))
    cleanupExpiredRefreshTokens(db).catch((err) =>
      console.error('Error cleaning up refresh tokens:', err)
    )

    // Return user data with JWT tokens and session info
    return {
      success: true,
      message: null,
      data: {
        user_id: String(user.id),
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
    const errors = error instanceof Error ? error.cause : null
    return { success: false, message, data: null, errors }
  }
})
