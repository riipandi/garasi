import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const { db } = event.context

  try {
    // Get token from query string
    const { token } = getQuery<{ token: string }>(event)

    // Validate token exists
    if (!token || token.trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token is required'
      })
    }

    // Find the reset token
    const resetToken = await db
      .selectFrom('password_reset_tokens')
      .selectAll()
      .where('token', '=', token)
      .executeTakeFirst()

    // Check if token exists
    if (!resetToken) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired reset token'
      })
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (resetToken.expires_at < now) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired reset token'
      })
    }

    // Check if token is already used
    if (resetToken.used !== 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Reset token has already been used'
      })
    }

    // Token is valid
    return {
      success: true,
      valid: true
    }
  } catch (error: any) {
    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error
    }

    // Handle unexpected errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
