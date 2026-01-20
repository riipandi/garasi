import { defineHandler, HTTPError } from 'nitro/h3'
import { verifyAccessToken } from '~/server/platform/jwt'
import {
  deactivateOtherSessions,
  revokeSessionRefreshTokens
} from '~/server/services/session.service'

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

    // Get current session ID from headers
    const currentSessionId = payload.sid

    if (!currentSessionId) {
      throw new HTTPError({ status: 400, statusText: 'Session ID is required' })
    }

    // Deactivate all other sessions for the user
    const deactivatedCount = await deactivateOtherSessions(db, userId, currentSessionId)

    // Get all sessions for the user to find the ones we just deactivated
    const allSessions = await db
      .selectFrom('sessions')
      .select(['id'])
      .where('user_id', '=', userId)
      .where('id', '!=', currentSessionId)
      .where('is_active', '=', 0)
      .execute()

    // Revoke refresh tokens for all deactivated sessions
    for (const session of allSessions) {
      await revokeSessionRefreshTokens(db, session.id)
    }

    // Return success message
    return {
      success: true,
      message: `Signed out from ${deactivatedCount} other device(s)`,
      data: {
        deactivated_count: deactivatedCount
      }
    }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.cause : null
    return { success: false, message, data: null, errors }
  }
})
