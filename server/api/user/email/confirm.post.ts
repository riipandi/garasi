import { HTTPError, getQuery, defineEventHandler } from 'h3'
import { sendMail } from '~/server/platform/mailer'
import { revokeUserRefreshTokens, deactivateAllSessions } from '~/server/services/session.service'

export default defineEventHandler(async (event) => {
  const { db } = event.context

  try {
    // Get token from query parameter
    const query = getQuery(event)
    const token = query.token as string

    if (!token) {
      throw new HTTPError({ status: 400, statusText: 'Token is required' })
    }

    // Find the email change token
    const emailChangeToken = await db
      .selectFrom('email_change_tokens')
      .select(['id', 'user_id', 'old_email', 'new_email', 'expires_at', 'used'])
      .where('token', '=', token)
      .executeTakeFirst()

    // Check if token exists
    if (!emailChangeToken) {
      throw new HTTPError({ status: 404, statusText: 'Invalid or expired token' })
    }

    // Check if token is already used
    if (emailChangeToken.used !== 0) {
      throw new HTTPError({ status: 400, statusText: 'This token has already been used' })
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000)
    if (emailChangeToken.expires_at < currentTime) {
      throw new HTTPError({ status: 400, statusText: 'Token has expired' })
    }

    // Get user details
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name'])
      .where('id', '=', emailChangeToken.user_id)
      .executeTakeFirst()

    if (!user) {
      throw new HTTPError({ status: 404, statusText: 'User not found' })
    }

    // Check if the old email in the token matches the current user email
    if (emailChangeToken.old_email !== user.email) {
      throw new HTTPError({
        status: 400,
        statusText:
          'Email change request is no longer valid. Your email may have been changed already.'
      })
    }

    // Check if the new email is already in use (double check)
    const existingUser = await db
      .selectFrom('users')
      .select(['id'])
      .where('email', '=', emailChangeToken.new_email)
      .executeTakeFirst()

    if (existingUser && existingUser.id !== user.id) {
      throw new HTTPError({
        status: 409,
        statusText: 'New email is already in use by another account'
      })
    }

    // Update user email
    await db
      .updateTable('users')
      .set({
        email: emailChangeToken.new_email,
        updated_at: currentTime
      })
      .where('id', '=', user.id)
      .execute()

    // Mark the token as used
    await db
      .updateTable('email_change_tokens')
      .set({ used: 1 })
      .where('id', '=', emailChangeToken.id)
      .execute()

    // Revoke all refresh tokens for security
    const revokedCount = await revokeUserRefreshTokens(db, user.id)

    // Deactivate all sessions for security
    const deactivatedCount = await deactivateAllSessions(db, user.id)

    // Send notification email to old email address
    await sendMail({
      to: emailChangeToken.old_email,
      subject: 'Your email has been changed',
      html: `
        <h2>Email Change Confirmation</h2>
        <p>Hello ${user.name},</p>
        <p>This is to confirm that your email address has been changed from <strong>${emailChangeToken.old_email}</strong> to <strong>${emailChangeToken.new_email}</strong>.</p>
        <p>If you did not make this change, please contact support immediately.</p>
        <p><strong>Security Notice:</strong> All your sessions have been terminated for security. Please sign in again with your new email address.</p>
      `
    })

    // Send confirmation email to new email address
    await sendMail({
      to: emailChangeToken.new_email,
      subject: 'Email change successful',
      html: `
        <h2>Email Change Successful</h2>
        <p>Hello ${user.name},</p>
        <p>Your email address has been successfully changed to <strong>${emailChangeToken.new_email}</strong>.</p>
        <p><strong>Security Notice:</strong> All your sessions have been terminated for security. Please sign in again with your new email address.</p>
        <p>If you did not make this change, please contact support immediately.</p>
      `
    })

    return {
      success: true,
      message:
        'Email changed successfully. All sessions have been terminated for security. Please sign in again with your new email address.',
      data: {
        new_email: emailChangeToken.new_email,
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
