import { defineHandler, readBody, HTTPError } from 'nitro/h3'
import { createResponse, createErrorResonse } from '~/server/platform/responder'
import { deactivateAllSessions } from '~/server/services/session.service'

interface ResetPasswordBody {
  token: string
  password: string
}

export default defineHandler(async (event) => {
  const { db, logger } = event.context

  try {
    // Parse request body
    const body = await readBody<ResetPasswordBody>(event)

    // Validate required fields
    if (!body || !body.token || !body.password) {
      logger.warn('Token and password are required')
      throw new HTTPError({ status: 400, statusText: 'Token and password are required' })
    }

    // Validate password strength
    if (body.password.length < 6) {
      logger.warn('Password must be at least 6 characters')
      throw new HTTPError({ status: 400, statusText: 'Password must be at least 6 characters' })
    }

    logger
      .withMetadata({ token: body.token.substring(0, 8) + '...' })
      .debug('Validating password reset token')

    // Find the reset token
    const resetToken = await db
      .selectFrom('password_reset_tokens')
      .selectAll()
      .where('token', '=', body.token)
      .executeTakeFirst()

    // Check if token exists
    if (!resetToken) {
      logger.warn('Invalid or expired reset token')
      throw new HTTPError({ status: 401, statusText: 'Invalid or expired token' })
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (resetToken.expiresAt < now) {
      logger.warn('Reset token has expired')
      throw new HTTPError({ status: 401, statusText: 'Invalid or expired token' })
    }

    // Check if token is already used
    if (resetToken.used !== 0) {
      logger.warn('Reset token has already been used')
      throw new HTTPError({ status: 401, statusText: 'Token has already been used' })
    }

    // Hash the new password
    const passwordHash = await Bun.password.hash(body.password)

    // Update user password
    await db
      .updateTable('users')
      .set({ passwordHash })
      .where('id', '=', resetToken.userId)
      .execute()

    // Mark token as used
    await db
      .updateTable('password_reset_tokens')
      .set({ used: 1 })
      .where('id', '=', resetToken.id)
      .execute()

    // Deactivate all sessions for security
    const deactivatedCount = await deactivateAllSessions(db, resetToken.userId)

    logger
      .withMetadata({ userId: resetToken.userId, deactivatedCount })
      .info('Password reset successful')

    return createResponse(
      event,
      'Password has been reset successfully. All sessions have been terminated for security.',
      {
        statusCode: 200,
        data: null
      }
    )
  } catch (error) {
    logger.withError(error).error('Error processing password reset')
    return createErrorResonse(event, error)
  }
})
