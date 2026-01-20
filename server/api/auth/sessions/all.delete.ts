import { defineHandler, HTTPError } from 'nitro/h3'
import { verifyAccessToken } from '~/server/platform/jwt'
import { deactivateAllSessions, revokeUserRefreshTokens } from '~/server/services/session.service'

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

    // Deactivate all sessions for the user
    const deactivatedCount = await deactivateAllSessions(db, userId)

    // Revoke all refresh tokens for the user
    const revokedCount = await revokeUserRefreshTokens(db, userId)

    // Return success message
    return {
      success: true,
      message: `Signed out from all devices (${deactivatedCount} session(s) deactivated, ${revokedCount} token(s) revoked)`,
      data: {
        deactivated_sessions: deactivatedCount,
        revoked_tokens: revokedCount
      }
    }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.cause : null
    return { success: false, message, data: null, errors }
  }
})
