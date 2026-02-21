import { HTTPError, getQuery, defineEventHandler } from 'h3'
import { sendMail } from '~/server/platform/mailer'
import { createErrorResonse, createResponse } from '~/server/platform/responder'
import { revokeUserRefreshTokens, deactivateAllSessions } from '~/server/services/session.service'

export default defineEventHandler(async (event) => {
  const { db, logger } = event.context

  try {
    // Get token from query parameter
    const query = getQuery(event)
    const token = query.token as string

    if (!token) {
      logger.warn('Token is required')
      throw new HTTPError({ status: 400, statusText: 'Token is required' })
    }

    logger
      .withMetadata({ token: token.substring(0, 8) + '...' })
      .debug('Validating email change token')

    // Find the email change token
    const emailChangeToken = await db
      .selectFrom('email_change_tokens')
      .selectAll()
      .where('token', '=', token)
      .executeTakeFirst()

    // Check if token exists
    if (!emailChangeToken) {
      logger.warn('Invalid or expired token')
      throw new HTTPError({ status: 401, statusText: 'Invalid or expired token' })
    }

    // Check if token is already used
    if (emailChangeToken.used !== 0) {
      logger.warn('Token has already been used')
      throw new HTTPError({ status: 401, statusText: 'This token has already been used' })
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000)
    if (emailChangeToken.expiresAt < currentTime) {
      logger.warn('Token has expired')
      throw new HTTPError({ status: 401, statusText: 'Token has expired' })
    }

    // Get user details
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name'])
      .where('id', '=', emailChangeToken.userId)
      .executeTakeFirst()

    if (!user) {
      logger.withMetadata({ userId: emailChangeToken.userId }).warn('User not found')
      throw new HTTPError({ status: 404, statusText: 'User not found' })
    }

    // Check if old email in token matches of current user email
    if (emailChangeToken.oldEmail !== user.email) {
      logger.warn('Email change request is no longer valid')
      throw new HTTPError({
        status: 400,
        statusText:
          'Email change request is no longer valid. Your email may have been changed already.'
      })
    }

    // Check if new email is already in use by another user (double check)
    const existingUser = await db
      .selectFrom('users')
      .select(['id'])
      .where('email', '=', emailChangeToken.newEmail)
      .executeTakeFirst()

    if (existingUser && existingUser.id !== user.id) {
      logger
        .withMetadata({ newEmail: emailChangeToken.newEmail })
        .warn('New email is already in use by another account')
      throw new HTTPError({
        status: 409,
        statusText: 'New email is already in use by another account'
      })
    }

    logger
      .withMetadata({
        userId: user.id,
        oldEmail: emailChangeToken.oldEmail,
        newEmail: emailChangeToken.newEmail
      })
      .debug('Updating user email')

    // Update user email
    await db
      .updateTable('users')
      .set({
        email: emailChangeToken.newEmail,
        updatedAt: currentTime
      })
      .where('id', '=', user.id)
      .execute()

    // Mark token as used
    await db
      .updateTable('email_change_tokens')
      .set({ used: 1 })
      .where('id', '=', emailChangeToken.id)
      .execute()

    // Revoke all refresh tokens for security
    const revokedCount = await revokeUserRefreshTokens(db, user.id)

    // Deactivate all sessions for security
    const deactivatedCount = await deactivateAllSessions(db, user.id)

    logger
      .withMetadata({ userId: user.id, revokedCount, deactivatedCount })
      .info('Email changed successfully')

    // Send notification email to old email address
    await sendMail({
      to: emailChangeToken.oldEmail,
      subject: 'Your email has been changed',
      html: `
        <h2>Email Change Confirmation</h2>
        <p>Hello ${user.name},</p>
        <p>This is to confirm that your email address has been changed from <strong>${emailChangeToken.oldEmail}</strong> to <strong>${emailChangeToken.newEmail}</strong>.</p>
        <p><strong>Security Notice:</strong> All your sessions have been terminated for security. Please sign in again with your new email address.</p>
        <p>If you did not make this change, please contact support immediately.</p>
      `
    })

    // Send confirmation email to new email address
    await sendMail({
      to: emailChangeToken.newEmail,
      subject: 'Email change successful',
      html: `
        <h2>Email Change Successful</h2>
        <p>Hello ${user.name},</p>
        <p>Your email address has been successfully changed to <strong>${emailChangeToken.newEmail}</strong>.</p>
        <p><strong>Security Notice:</strong> All your sessions have been terminated for security. Please sign in again with your new email address.</p>
        <p>If you did not make this change, please contact support immediately.</p>
      `
    })

    return createResponse(
      event,
      'Email changed successfully. All sessions have been terminated for security. Please sign in again with your new email address.',
      {
        data: {
          new_email: emailChangeToken.newEmail,
          revoked_tokens: revokedCount,
          deactivated_sessions: deactivatedCount
        }
      }
    )
  } catch (error) {
    logger.withError(error).error('Error processing email change confirmation')
    return createErrorResonse(event, error)
  }
})
