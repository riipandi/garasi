import { defineHandler, HTTPError, readBody } from 'nitro/h3'
import { verifyAccessToken } from '~/server/platform/jwt'
import { revokeUserRefreshTokens, deactivateAllSessions } from '~/server/services/session.service'

interface ChangePasswordBody {
  current_password: string
  new_password: string
}

export default defineHandler(async (event) => {
  const { db } = event.context

  try {
    // Get Authorization header
    const authHeader = event.req.headers.get('authorization')

    // Validate Authorization header exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPError({
        status: 401,
        statusText: 'Unauthorized: Missing or invalid Authorization header'
      })
    }

    // Extract token from Authorization header
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the access token
    const payload = await verifyAccessToken(token)

    // Get user ID from token payload (sub claim)
    const userId = payload.sub

    if (!userId) {
      throw new HTTPError({ status: 401, statusText: 'Unauthorized: Invalid token payload' })
    }

    // Parse request body
    const body = await readBody<ChangePasswordBody>(event)

    // Validate required fields
    if (!body?.current_password || !body?.new_password) {
      throw new HTTPError({
        status: 400,
        statusText: 'Current password and new password are required'
      })
    }

    // Validate password strength
    if (body.new_password.length < 6) {
      throw new HTTPError({ status: 400, statusText: 'New password must be at least 6 characters' })
    }

    // Check if new password is the same as current
    if (body.current_password === body.new_password) {
      throw new HTTPError({
        status: 400,
        statusText: 'New password must be different from current password'
      })
    }

    // Find user by ID
    const user = await db
      .selectFrom('users')
      .select(['id', 'password_hash'])
      .where('id', '=', userId)
      .executeTakeFirst()

    // Check if user exists
    if (!user) {
      throw new HTTPError({ status: 404, statusText: 'User not found' })
    }

    // Verify current password
    const isPasswordValid = await Bun.password.verify(body.current_password, user.password_hash)

    if (!isPasswordValid) {
      throw new HTTPError({ status: 401, statusText: 'Current password is incorrect' })
    }

    // Hash the new password
    const newPasswordHash = await Bun.password.hash(body.new_password)

    // Update user password
    await db
      .updateTable('users')
      .set({ password_hash: newPasswordHash })
      .where('id', '=', userId)
      .execute()

    // Revoke all refresh tokens for security
    const revokedCount = await revokeUserRefreshTokens(db, userId)

    // Deactivate all sessions for security
    const deactivatedCount = await deactivateAllSessions(db, userId)

    // Return success message
    return {
      success: true,
      message:
        'Password changed successfully. All sessions have been terminated for security. Please sign in again.',
      data: {
        revoked_tokens: revokedCount,
        deactivated_sessions: deactivatedCount
      }
    }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.cause : null
    return { success: false, message, data: null, errors }
  }
})
