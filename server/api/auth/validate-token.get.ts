import { defineEventHandler, getQuery, HTTPError } from 'h3'
import { createErrorResonse } from '~/server/platform/responder'

export default defineEventHandler(async (event) => {
  const { db } = event.context

  try {
    // Get token from query string
    const { token } = getQuery<{ token: string }>(event)

    // Validate token exists
    if (!token || token.trim() === '') {
      throw new HTTPError({ status: 400, statusText: 'Token is required' })
    }

    // Find the reset token
    const resetToken = await db
      .selectFrom('password_reset_tokens')
      .selectAll()
      .where('token', '=', token)
      .executeTakeFirst()

    // Check if token exists
    if (!resetToken) {
      throw new HTTPError({ status: 400, statusText: 'Invalid or expired token' })
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (resetToken.expiresAt < now) {
      throw new HTTPError({ status: 400, statusText: 'Invalid or expired token' })
    }

    // Check if token is already used
    if (resetToken.used !== 0) {
      throw new HTTPError({ status: 400, statusText: 'Token has already been used' })
    }

    // Token is valid
    return { success: true, message: 'Token valid', data: { is_token_valid: true } }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
