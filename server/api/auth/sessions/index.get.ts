import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { getUserSessions } from '~/server/services/session.service'
import type { ListSessionsResponse } from '~/shared/schemas/user.schema'

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context

  const sessions = await getUserSessions(db, auth.userId)

  logger
    .withMetadata({ userId: auth.userId, sessionCount: sessions.length })
    .debug('User sessions retrieved')

  return createResponse<ListSessionsResponse>(event, 'Sessions retrieved successfully', {
    statusCode: 200,
    data: {
      sessions: sessions.map((session) => ({
        id: session.id,
        userId: session.userId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt: new Date((session.createdAt ?? Date.now() / 1000) * 1000).toISOString(),
        expiresAt: new Date(session.expiresAt * 1000).toISOString(),
        isCurrent: session.id === auth.sessionId
      }))
    }
  })
})
