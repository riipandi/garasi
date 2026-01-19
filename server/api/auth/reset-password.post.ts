import { defineEventHandler, readBody, createError, getQuery } from 'h3'

interface ResetPasswordBody {
  token: string
  password: string
}

export default defineEventHandler(async (event) => {
  const { db } = event.context

  try {
    // Get token from query string
    const { token } = getQuery<{ token: string }>(event)

    // Parse request body
    const body = await readBody<ResetPasswordBody>(event)

    // Validate required fields
    if (!token || !body || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token and password are required'
      })
    }

    // Validate password strength
    if (body.password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 6 characters'
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

    // Hash the new password
    const passwordHash = await Bun.password.hash(body.password)

    // Update user password
    await db
      .updateTable('users')
      .set({ password_hash: passwordHash })
      .where('id', '=', resetToken.user_id)
      .execute()

    // Mark token as used
    await db
      .updateTable('password_reset_tokens')
      .set({ used: 1 })
      .where('id', '=', resetToken.id)
      .execute()

    return {
      success: true,
      message: 'Password has been reset successfully'
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
