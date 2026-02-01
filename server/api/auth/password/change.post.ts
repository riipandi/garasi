import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { revokeUserRefreshTokens, deactivateAllSessions } from '~/server/services/session.service'

interface ChangePasswordBody {
  current_password: string
  new_password: string
}

export default defineProtectedHandler(async (event) => {
  const { db, auth, logger } = event.context

  // Parse request body
  const body = await readBody<ChangePasswordBody>(event)

  // Validate required fields
  if (!body?.current_password || !body?.new_password) {
    logger.warn('Current password and new password are required')
    throw new HTTPError({
      status: 400,
      statusText: 'Current password and new password are required'
    })
  }

  // Validate password strength
  if (body.new_password.length < 6) {
    logger.warn('New password must be at least 6 characters')
    throw new HTTPError({ status: 400, statusText: 'New password must be at least 6 characters' })
  }

  // Check if new password is the same as current
  if (body.current_password === body.new_password) {
    logger.warn('New password must be different from current password')
    throw new HTTPError({
      status: 400,
      statusText: 'New password must be different from current password'
    })
  }

  logger.withMetadata({ userId: auth.userId }).debug('Attempting to change user password')

  // Find user by ID
  const user = await db
    .selectFrom('users')
    .select(['id', 'passwordHash'])
    .where('id', '=', auth.userId)
    .executeTakeFirst()

  // Check if user exists
  if (!user) {
    logger.withMetadata({ userId: auth.userId }).warn('User not found')
    throw new HTTPError({ status: 404, statusText: 'User not found' })
  }

  // Verify current password
  const isPasswordValid = await Bun.password.verify(body.current_password, user.passwordHash)

  if (!isPasswordValid) {
    logger.withMetadata({ userId: auth.userId }).warn('Current password is incorrect')
    throw new HTTPError({ status: 401, statusText: 'Current password is incorrect' })
  }

  // Hash the new password
  const newPasswordHash = await Bun.password.hash(body.new_password)

  // Update user password
  await db
    .updateTable('users')
    .set({ passwordHash: newPasswordHash })
    .where('id', '=', auth.userId)
    .execute()

  // Revoke all refresh tokens for security
  const revokedCount = await revokeUserRefreshTokens(db, auth.userId)

  // Deactivate all sessions for security
  const deactivatedCount = await deactivateAllSessions(db, auth.userId)

  logger
    .withMetadata({ userId: auth.userId, revokedCount, deactivatedCount })
    .info('Password changed successfully')

  return createResponse(
    event,
    'Password changed successfully. All sessions have been terminated for security. Please sign in again.',
    {
      statusCode: 200,
      data: {
        revoked_tokens: revokedCount,
        deactivated_sessions: deactivatedCount
      }
    }
  )
})
