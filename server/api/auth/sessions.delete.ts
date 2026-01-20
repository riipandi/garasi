import { defineHandler, HTTPError, readBody } from 'nitro/h3'
import { verifyAccessToken } from '~/server/platform/jwt'
import { deactivateSession, revokeSessionRefreshTokens } from '~/server/services/session.service'

export default defineHandler(async (event) => {
  const { db } = event.context

  try {
    // Get Authorization header
    const authHeader = event.req.headers.get('authorization')

    // Validate Authorization header exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPError({
        status: 401,
        statusText: 'Unauthorized: Missing or invalid Authorization header'
      })
    }

    // Extract token from Authorization header
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the access token
    const payload = await verifyAccessToken(token)

    // Get user ID from token payload (sub claim)
    const userId = payload.sub

    if (!userId) {
      throw new HTTPError({ status: 401, statusText: 'Unauthorized: Invalid token payload' })
    }

    // Parse request body
    const body = await readBody<{ session_id: string }>(event)

    // Validate required fields
    if (!body?.session_id) {
      throw new HTTPError({ status: 400, statusText: 'Session ID is required' })
    }

    // Deactivate the session
    const deactivatedCount = await deactivateSession(db, body.session_id)

    if (deactivatedCount === 0) {
      throw new HTTPError({ status: 404, statusText: 'Session not found' })
    }

    // Revoke all refresh tokens for this session
    await revokeSessionRefreshTokens(db, Number(userId))

    // Return success message
    return {
      success: true,
      message: 'Session revoked successfully',
      data: null
    }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.cause : null
    return { success: false, message, data: null, errors }
  }
})
