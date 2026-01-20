import { defineHandler, HTTPError } from 'nitro/h3'
import { verifyAccessToken } from '~/server/platform/jwt'
import { getUserSessions } from '~/server/services/session.service'

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

    // Get all active sessions for the user
    const sessions = await getUserSessions(db, Number(userId))

    // Return sessions
    return {
      success: true,
      message: 'Sessions retrieved successfully',
      data: {
        sessions: sessions.map((session) => ({
          session_id: session.session_id,
          ip_address: session.ip_address,
          device_info: session.device_info,
          last_activity_at: session.last_activity_at,
          expires_at: session.expires_at,
          created_at: session.created_at
        }))
      }
    }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.cause : null
    return { success: false, message, data: null, errors }
  }
})
