import { defineProtectedHandler } from '~/server/platform/guards'
import { getUserSessions } from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context

  // Get all active sessions for the user
  const sessions = await getUserSessions(db, auth.userId)

  logger
    .withMetadata({ userId: auth.userId, sessionCount: sessions.length })
    .debug('User sessions retrieved')

  // Return sessions
  return {
    success: true,
    message: 'Sessions retrieved successfully',
    data: {
      sessions: sessions.map((session) => ({
        session_id: session.id,
        ip_address: session.ipAddress,
        device_info: session.deviceInfo,
        last_activity_at: session.lastActivityAt,
        expires_at: session.expiresAt,
        created_at: session.createdAt
      }))
    }
  }
})
