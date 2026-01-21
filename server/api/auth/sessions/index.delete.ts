import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createErrorResonse } from '~/server/platform/responder'
import { deactivateSession, revokeSessionRefreshTokens } from '~/server/services/session.service'

export default defineProtectedHandler(async (event) => {
  const { db } = event.context

  try {
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
    await revokeSessionRefreshTokens(db, body.session_id)

    // Return success message
    return {
      success: true,
      message: 'Session revoked successfully',
      data: null
    }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
