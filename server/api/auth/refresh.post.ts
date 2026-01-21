import { defineHandler, HTTPError, readBody } from 'nitro/h3'
import { generateTokenPair, verifyRefreshToken } from '~/server/platform/jwt'
import {
  validateRefreshToken,
  revokeRefreshToken,
  storeRefreshToken,
  updateSessionActivity
} from '~/server/services/session.service'

export default defineHandler(async (event) => {
  const { db } = event.context

  try {
    // Parse request body
    const body = await readBody<{ refresh_token: string; session_id: string }>(event)

    // Validate required fields
    if (!body?.refresh_token) {
      throw new HTTPError({ status: 400, statusText: 'Refresh token is required' })
    }

    if (!body?.session_id) {
      throw new HTTPError({ status: 400, statusText: 'Session ID is required' })
    }

    // Verify the refresh token signature and type
    const payload = await verifyRefreshToken(body.refresh_token)

    if (!payload.sub) {
      throw new HTTPError({ status: 401, statusText: 'Invalid refresh token payload' })
    }

    // Validate the refresh token in the database
    const tokenRecord = await validateRefreshToken(db, body.refresh_token)

    if (!tokenRecord) {
      throw new HTTPError({ status: 401, statusText: 'Invalid or expired refresh token' })
    }

    // Get user agent from request
    const userAgent = event.req.headers.get('user-agent') || 'unknown'

    // Generate new token pair with session ID
    const tokens = await generateTokenPair(
      { userId: payload.sub, sessionId: body.session_id },
      userAgent
    )

    // Revoke the old refresh token
    await revokeRefreshToken(db, body.refresh_token)

    // Store the new refresh token in the database
    await storeRefreshToken(
      db,
      tokenRecord.user_id,
      tokenRecord.session_id,
      tokens.refreshToken,
      tokens.refreshTokenExpiry
    )

    // Update session activity
    await updateSessionActivity(db, body.session_id)

    // Return new tokens with session ID
    return {
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        session_id: body.session_id,
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
