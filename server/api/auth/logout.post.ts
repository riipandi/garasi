import { defineHandler, HTTPError, readBody } from 'nitro/h3'
import { verifyRefreshToken } from '~/server/platform/jwt'
import { deactivateSession, revokeRefreshToken } from '~/server/services/session.service'

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

    // Revoke the refresh token
    await revokeRefreshToken(db, body.refresh_token)

    // Deactivate the session
    await deactivateSession(db, body.session_id)

    // Return success message
    return {
      success: true,
      message: 'Logged out successfully',
      data: null
    }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.cause : null
    return { success: false, message, data: null, errors }
  }
})
