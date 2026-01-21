import { HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { getUserSessions } from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db, auth } = event.context

  try {
    // Get all active sessions for the user
    const sessions = await getUserSessions(db, auth.userId)

    // Return sessions
    return {
      success: true,
      message: 'Sessions retrieved successfully',
      data: {
        sessions: sessions.map((session) => ({
          session_id: session.id,
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
    const errors = error instanceof Error ? error.stack : null
    return { success: false, message, data: null, errors }
  }
})
