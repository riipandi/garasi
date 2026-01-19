import { defineEventHandler, readBody, getQuery, HTTPError } from 'h3'

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
      throw new HTTPError({ status: 400, statusText: 'Token and password are required' })
    }

    // Validate password strength
    if (body.password.length < 6) {
      throw new HTTPError({ status: 400, statusText: 'Password must be at least 6 characters' })
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
    if (resetToken.expires_at < now) {
      throw new HTTPError({ status: 400, statusText: 'Invalid or expired token' })
    }

    // Check if token is already used
    if (resetToken.used !== 0) {
      throw new HTTPError({ status: 400, statusText: 'Token has already been used' })
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
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.cause : null
    return { status: 'error', message, errors }
  }
})
