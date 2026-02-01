import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { getUserSessions } from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context

  const sessions = await getUserSessions(db, auth.userId)

  logger
    .withMetadata({ userId: auth.userId, sessionCount: sessions.length })
    .debug('User sessions retrieved')

  return createResponse(event, 'Sessions retrieved successfully', {
    statusCode: 200,
    data: {
      sessions: sessions.map((session) => ({
        id: session.id,
        ip_address: session.ipAddress,
        device_info: session.deviceInfo,
        last_activity_at: session.lastActivityAt,
        expires_at: session.expiresAt,
        created_at: session.createdAt,
        is_current: session.id === auth.sessionId
      }))
    }
  })
})
